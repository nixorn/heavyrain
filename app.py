#!/usr/bin/env python
import uuid
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
from lib.figure import new_figure, increment, decrement
from lib.hole import new_hole
from lib.player import new_player
from lib.wall import get_free_wall


# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = "eventlet"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('disconnect request', namespace='/game')
def disconnect_request():
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': 'Disconnected!', 'count': session['receive_count']})
    disconnect()


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
    emit('connect', {'data': 'OK'})


@socketio.on('start', namespace='/game')    
def start():
    figures = [new_figure() for i in range(5)]
    player = new_player(figures=[f['uid'] for f in figures])
    holes = [new_hole(vertex=i) for i in range(7)]
    wall = get_free_wall(holes=[h['uid'] for h in holes],
                         player=player)
    emit('start_game', {'data': {'player': player,
                                 'wall': wall,
                                 'holes': holes,
                                 'figures': figures,}})



@socketio.on_error_default  # handles all namespaces without an explicit error handler
def default_error_handler(e):
    print('EXCEPTION', e.with_traceback(None))


@socketio.on('disconnect', namespace='/game')
def disconnect():
    print('Client disconnected', request.sid)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=4093)
