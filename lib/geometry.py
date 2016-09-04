#!/usr/bin/env python


def increment(geometry):
    geometry = geometry.copy()
    geometry['vertex'] += 1
    return geometry


def decrement(geometry):
    geometry = geometry.copy()
    geometry['vertex'] -= 1
    return geometry




