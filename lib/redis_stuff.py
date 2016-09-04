import redis
redis_figures = redis.StrictRedis(host='localhost', port=6379, db=0)
redis_holes = redis.StrictRedis(host='localhost', port=6379, db=1)
redis_players = redis.StrictRedis(host='localhost', port=6379, db=2)
redis_walls = redis.StrictRedis(host='localhost', port=6379, db=3)
