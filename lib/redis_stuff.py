import redis
import json
from json import JSONDecodeError
redis_figures = redis.StrictRedis(host='localhost', port=6379, db=0)
redis_holes = redis.StrictRedis(host='localhost', port=6379, db=1)
redis_players = redis.StrictRedis(host='localhost', port=6379, db=2)
redis_walls = redis.StrictRedis(host='localhost', port=6379, db=3)


def set_redis_value(key, value, connection):
    try:
        if not isinstance(key, str):
            raise Exception('key should be THE string!')
        if type(value) in [list, dict]:
            value = json.dumps(value)
        connection.set(key, value)
        return 'OK!'
    except Exception as e:
        print(e)
        return False


def get_redis_value(key, connection):
    try:
        return json.loads(connection.get(key).decode('utf8'))
    except Exception as e:
        print(e)
        return connection.get(key)
