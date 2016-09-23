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
from lib.hole import new_hole
from lib.player import (new_player,
                        destroy_player)
from lib.wall import get_free_wall
from lib.redis_stuff import (get_redis_value,
                             redis_players,
                             redis_figures,
                             redis_holes)


# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = "eventlet"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.debug = True
socketio = SocketIO(app, async_mode=async_mode)
thread = None


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
    emit('connect', {'data': 'OK'})


@socketio.on('disconnect', namespace='/game')
def disconnect():
    #from lib.player import destroy_player
    print('DISCONNECTING', request.sid)
    destroy_player(request.sid)
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


@socketio.on_error_default
def default_error_handler(e):
    raise e


if __name__ == '__main__':
    socketio.run(app, debug=True, port=4093)
