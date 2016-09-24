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
                      check_put_success)
from lib.player import (new_player,
                        destroy_player)
from lib.wall import (get_free_wall,
                      move_figure,
                      get_wall_by_hole)
from lib.redis_stuff import (get_redis_value,
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
FIGURE_SPAMERS = {}

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('increm', namespace='/game')
def increment():
    try:
        increment(request.uid)
        emit('increment', {'data': 'OK'})
    except Exception as e:
        emit('increment', {'data': 'FAIL',
                           'error': e.message})


@socketio.on('decrement', namespace='/game')
def decrement():
    try:
        decrement(request.uid)
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

    spamer = generator(request.sid, request.namespace)
    spamer.start()
    FIGURE_SPAMERS[request.sid] = spamer
    emit('connect', {'data': 'OK'})


@socketio.on('disconnect', namespace='/game')
def disconnect():
    #from lib.player import destroy_player
    print('DISCONNECTING', request.sid)
    destroy_player(request.sid)
    spamer = FIGURE_SPAMERS.get(request.sid)
    if spamer:
        spamer.stop()
        del spamer
        del FIGURE_SPAMERS[request.sid]
    print('DISCONNECTED', request.sid)


@socketio.on('start', namespace='/game')
def start():
    player = get_redis_value(key=request.sid,
                             connection=redis_players)
    figures = [get_redis_value(key=fig,
                               connection=redis_figures) for fig in player['figures']]
    wall = get_free_wall(player=player)
    holes = [get_redis_value(huid, redis_holes) for huid in wall['holes']]
    emit('start_game', {'data': {'player': player,
                                 'wall': wall,
                                 'holes': holes,
                                 'figures': figures,}})


@socketio.on('put', namespace='/game')
def put(data):
    print('PUT REQUEST', data)
    figure_uid = data.get('figure_uid')
    if not figure_uid:
        emit('put_failed',
             {'data': 'give the figure_uid'})
    hole_uid = data.get('hole_uid')
    if not hole_uid:
        emit('put_failed',
             {'data': 'give the hole_uid'})

    figure = get_redis_value(figure_uid, redis_figures)
    hole = get_redis_value(hole_uid, redis_holes)
    wall = get_wall_by_hole(hole_uid)
    if len(wall['players']) <= 1:
        emit('put_failed', {
             'data': 'wall have less then one player'
        })
        return
    elif len(wall['players']) >= 3:
        emit('put_failed', {
            'data': 'more than 2 players. wtf?'
        })
        return
    players = [get_redis_value(p_uid, redis_players) for p_uid in wall['players']]
    player_from = [p for p in players if figure_uid in p['figures']]
    if player_from:
        player_from = player_from[0]
    else:
        emit('put_failed', {
            'data': 'can not get player who putting'
        })
        return

    player_to = [p for p in players if figure_uid not in p['figures']]
    if player_to:
        player_to = player_to[0]
    else:
        emit('put_failed', {
            'data': 'can not get player who recieve figure'
        })
        return
    print('player_from', player_from)
    print('player_to', player_to)
    put_figure(hole['uid'],
               figure['uid'],
               player_to['uid'],
               player_from['uid'])
    emit('put_started')
    emit('figure_is_coming',
         {'data':{'hole_uid':hole['uid']}},
         room=player_to['uid'])
    time.sleep(FIGURE_PASSING_TIME)
    if check_put_success(hole['uid']):
        print('GOING TO SEND PUT SUCESS')
        emit('put_success')
        emit('remove_figure', figure['uid'])
        emit('new_figure',
             {'data': {'figure': figure}},
             room=player_to['uid'])
    else:
        emit('put_fail')


@socketio.on('hit', namespace='/game')
def hit(hole_uid):
    break_put(hole_uid)


@socketio.on_error_default
def default_error_handler(e):
    raise e


if __name__ == '__main__':
    socketio.run(app, debug=True, port=4093)
