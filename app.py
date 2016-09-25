#!/usr/bin/env python
import uuid
from flask import (Flask,
                   render_template,
                   session,
                   request)
from flask_socketio import (SocketIO,
                            emit,
                            join_room,
                            leave_room,
                            close_room,
                            rooms,
                            disconnect)
from lib.figure import (new_figure,
                        increment,
                        decrement)
from lib.hole import (new_hole,
                      put_figure,
                      break_put,
                      ensure_put_success)
from lib.player import (new_player,
                        destroy_player,
                        get_player)
from lib.wall import (get_free_wall,
                      get_wall_by_hole,
                      get_opponent)
from lib.redis_stuff import (get_redis_value,
                             set_redis_value,
                             redis_players,
                             redis_figures,
                             redis_holes)
from lib.figure_gen import generator
import time


# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = "eventlet"

app = Flask(__name__, static_folder='templates', static_path="")
app.config['SECRET_KEY'] = 'secret!'
app.debug = True
socketio = SocketIO(app, async_mode=async_mode)
thread = None

FIGURE_PASSING_TIME = 1
FIGURE_SPAWN_TIMEOUT = 3
FIGURE_SPAMERS = {}

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('increm', namespace='/game')
def increment(data):
    figure_uid = data.get('figure_uid')
    try:
        increment(figure_uid)
        emit('increment', {'data': 'OK'})
    except Exception as e:
        emit('increment', {'data': 'FAIL',
                           'error': e.message})


@socketio.on('decrement', namespace='/game')
def decrement(data):
    figure_uid = data.get('figure_uid')
    try:
        decrement(figure_uid)
        emit('decrement', {'data': 'OK'})
    except Exception as e:
        emit('decrement', {'data': 'FAIL',
                           'error': e.message})


@socketio.on('connect', namespace='/game')
def connect():
    print('CONNECT', request.sid)
    figures = [new_figure() for i in range(5)]
    player = new_player(figures=[f['uid'] for f in figures],
                        uid=request.sid)
    emit('connect', {'data': 'OK'})


@socketio.on('disconnect', namespace='/game')
def disconnect():
    print('DISCONNECTING', request.sid)
    destroy_player(request.sid)
    opponent = get_opponent(request.sid)
    if opponent:
        emit('opponent_left',
             {},
             room=opponent['uid'])
    print('DISCONNECTED', request.sid)


@socketio.on('start', namespace='/game')
def start():
    player = get_player(request.sid)
    figures = [get_redis_value(key=fig,
                               connection=redis_figures) for fig in player['figures']]
    wall = get_free_wall(player=player)
    opponent = get_opponent(request.sid)
    print('opponent of this guy is', opponent)
    holes = [get_redis_value(huid, redis_holes) for huid in wall['holes']]
    emit('start_game', {'data': {'player': player,
                                 'wall': wall,
                                 'holes': holes,
                                 'figures': figures,
                                 'opponent': opponent}})
    if opponent:
        emit('opponent_update',
             {'data':{'opponent': player}},
             room=opponent['uid'])


@socketio.on('set_name', namespace='/game')
def set_name(data):
    name = data.get('name')
    player = get_player(request.sid)
    player['name'] = name
    set_redis_value(player['uid'], player, redis_players)
    opponent = get_opponent(player['uid'])
    if opponent:
        emit('opponent_update',
             {'data':{'opponent': player}},
             room=opponent['uid'])



@socketio.on('put', namespace='/game')
def put(data):
    print('PUT REQUEST', data)
    figure_uid = data.get('figure_uid')
    if not figure_uid:
        print('give the figure_uid')
        return 'fail'
    hole_uid = data.get('hole_uid')
    if not hole_uid:
        print('give the hole_uid')
        return 'fail'
    figure = get_redis_value(figure_uid, redis_figures)
    hole = get_redis_value(hole_uid, redis_holes)
    wall = get_wall_by_hole(hole_uid)
    if len(wall['players']) <= 1:
        print('wall have less then one player')
        return 'fail'
    elif len(wall['players']) >= 3:
        print('more than 2 players')
        return 'fail'
    players = [get_player(p_uid) for p_uid in wall['players']]
    print ('PLAYERS', players)
    player_from = [p for p in players if figure_uid in p['figures']]
    if player_from:
        player_from = player_from[0]
    else:
        print('can not get player who putting')
        return 'fail'

    player_to = [p for p in players if figure_uid not in p['figures']]
    if player_to:
        player_to = player_to[0]
    else:
        print('can not get player who recieve figure')
        return 'fail'
    print('player_from', player_from)
    print('player_to', player_to)
    emit('put_started')
    emit('figure_is_coming',
         {'data':{'hole_uid':hole['uid']}},
         room=player_to['uid'])
    put_figure(hole['uid'],
               figure['uid'],
               player_to['uid'],
               player_from['uid'])

    socketio.sleep(FIGURE_PASSING_TIME)
    if ensure_put_success(hole['uid'],
                          figure['uid'],
                          player_from['uid'],
                          player_to['uid']):
        
        emit('remove_figure', figure['uid'])
        emit('new_figure',
             {'data': {'figure': figure,
                       'hole_uid': hole_uid}},
             room=player_to['uid'])
        return 'ok'
    else:
        return 'fail'


@socketio.on('give_me_figure', namespace='/game')
def give_me_figure(data):
    vertex = data.get('vertex')
    player = get_player(request.sid)
    fig = new_figure(vertex)
    player['figures'].append(fig['uid'])
    set_redis_value(request.sid, player, redis_players)
    return figure


@socketio.on('hit', namespace='/game')
def hit(hole_uid):
    break_put(hole_uid)
    hitman = get_redis_value(request.sid, redis_players)
    players = get_wall_by_hole(hole_uid)['players']
    players = players.remove(hitman['uid'])
    if players:
        other_side_player_uid = players.pop()
        emit('hit', {'data':{
            'hole': hole_uid}},
             room=other_side_player_uid)



@socketio.on_error_default
def default_error_handler(e):
    raise e


if __name__ == '__main__':
    from lib.redis_stuff import flush_all
    flush_all()
    socketio.run(app, debug=True, port=4093)
