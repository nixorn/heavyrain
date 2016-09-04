#!/usr/bin/env python
import uuid
import random
from .redis_stuff import redis_conn


def new_hole(vertex=None):
    hole = {'uid': uuid.uuid1().hex,
            'vertex': vertex if vertex else random.randint(1, 7)}
    return hole['uid']
