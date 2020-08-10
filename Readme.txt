
Instrucciones del proyecto

Separador: caracter "|"
URI: http://localhost:3800/twitter/command
Parametro del body :  command
Todas los comandos se escriben en MAYUSCULAS
Ruta global: "/twitter"

FUNCIONES 
Estructura de las funciones en postman

- REGISTER
    funcion    name    username  password  phone        email
    REGISTER|Gildardo|gilD Alvara|123456|549032165|glgil@gmail.com

- LOGIN
    LOGIN|username|password

- PERFIL
    PERFIL|username

- ADD_TWEET
    ADD_TWEET| texto

- EDIT_TWEET
    EDIT_TWEET| id_tweet | texto

- DELETE_TWEET
    DELETE_TWEET|id_tweet 

- VIEW_TWEETS
    VIEW_TWEETS|username  (Puede ver los tweets de todos los usuarios pero no el suyo ya que este no se puede busar a si mismo en su cuenta)

- FOLLOW
    FOLLOW|username

- UNFOLLOW
    UNFOLLOW|username

- LIKE
    UNFOLLOW|id_tweet

- DISLIKE
    UNFOLLOW|id_tweet

- REPLY_TWEET
    UNFOLLOW| id_tweet | Comentario

- RETWEET
    UNFOLLOW| id_tweet | Comentario (Opcional)