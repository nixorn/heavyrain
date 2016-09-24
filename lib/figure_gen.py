import time
import threading
from .figure import new_figure
from .player import add_figure
from .redis_stuff import redis_players


class _GenThread(threading.Thread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._stopped = threading.Event()

    def run(self):
        print('TRYING TO RUN SPAMER')
        player_id = self._kwargs.get('player_id', None)
        interval = self._kwargs.get('interval', 2)
        socket = self._kwargs.get('socket', 2)
        if not player_id:
            self._stopped.set()
        while not self._stopped.is_set():
            print('TRYING TO SPAM SPAM SPAM')
            new_fig = new_figure()
            add_figure(player_id, new_fig['uid'])
            socket.emit('new_figure', {'data': new_fig}, room=player_id)
            time.sleep(interval)

    def stop(self):
        self._stopped.set()

def generator(player_id, socket, timeout=2):
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
    thread = _GenThread(kwargs={'player_id': player_id,
                                'timeout': timeout,
                                'socket': socket})
    thread.daemon = True
    return thread
