import time
import threading
from flask_socketio import emit
from .figure import new_figure
from .player import add_figure
from .redis_stuff import redis_players


class _GenThread(threading.Thread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._stopped = threading.Event()

    def run(self):
        player_id = self.kwargs.get('player_id', None)
        interval = self.kwargs.get('interval', 2)
        if not player_id:
            self._stopped.set()
        while not self._stopped.is_set():
            new_fig = new_figure()
            add_figure(player_id, new_fig['uid'])
            emit('new_figure', {'data': new_fig}, room=player_id)
            time.sleep(interval)

    def stop(self):
        self._stopped.set()

def generator(player_id, timeout=2):
    """
    Figure generator.
    >>> from .figure_gen import generator
    Start figure generation:
    >>> gen_thread = generator('player_uid', timeout=5)
    Stop figure generation:
    >>> gen_thread.stop()

    :param player_id: str, player's UID'
    :param timeout: int, timeout in seconds
    """
    thread = _GenThread(kwargs={'player_id': player_id, 'timeout': timeout})
    thread.daemon = True
    return thread
