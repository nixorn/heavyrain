#!/usr/bin/env python
"""
Плеер это чувак, который тилибонькает фигурки.
Плеер = игровое пространство плеера, в котором бултыхаются фигурки. И бобер.
Плеер связан со стеной, которая связывает его игровое пространство с 
пространством каким-то другим."""
import uuid
from .figure import new_figure
from .hole import new_hole
from .redis_stuff import redis_players


def new_player():
    player = {}
    player['uid'] = uuid.uuid1().hex
    player['figures'] = [new_figure() for i in range(5)]
    player['scores'] = 0
    redis_players.set(player['uid'], player)
    return player

def 


def move_figure(player_from, player_to, figure):
    pass


def break_moving(figure):
    pass

def destroy_player(uid):
    pass
