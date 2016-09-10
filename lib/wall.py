#!/usr/bin/env python
import uuid
from .hole import new_hole


def new_wall():
    """Новую стенку тебе, чтобы было обо что бицо."""
    wall = {'uid': uuid.uuid1().hex,
            'holes': [new_hole()],
            'player1': '',
            'player2': ''}


def is_both_players(wall_uid):
    """с обоих ли сторон стены есть по плееру.
    """
    pass


def get_free_wall():
    """Получить первую свободную стену.
    Если свободных нет - создать новую и вернуть."""
    wall = {}
    return wall
