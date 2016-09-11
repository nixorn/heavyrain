#!/usr/bin/env python
import uuid
import random
from .redis_stuff import redis_holes, set_redis_value, get_redis_value

STATES = {'free', 'busy'}

def new_hole(vertex=None):
    hole = {'uid': uuid.uuid1().hex,
            'vertex': vertex if vertex else random.randint(1, 7),
            'state': 'free'}
    set_redis_value(hole['uid'], hole, redis_holes)
    return hole
