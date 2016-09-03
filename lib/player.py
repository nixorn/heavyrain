#!/usr/bin/env python
import uuid
from .geometry import new_figure, new_hole 


def new_player():
    player = {}
    player['uid'] = uuid.uuid1().hex
    player['figures'] = [new_figure() for i in range(5)]
    player['holes'] = [new_hole() for i in range(5)]
    player['scores'] = 0
    return player
