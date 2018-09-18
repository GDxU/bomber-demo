var playerManager = {
    personajes:[],
    id:0,
    emitStop:true
};
playerManager.Draw = function(ctx){
    this.personajes.forEach(element => {
        this.personajes[element.id].Draw(ctx);
    });
}
playerManager.Update = function(){
    this.mover();
    this.personajes.forEach(element => {
        this.personajes[element.id].Update();
    });
}
playerManager.solido = function(x,y, player){
    var esSolido = false;
    temporal = player.hitbox.copiar();
    temporal.x += x;
    temporal.y += y;
    bombManager.bombs.forEach(bomba => {
    if(!bomba.recienColocada)
        esSolido = bomba.hitbox.chocarCon(temporal);
    else if(!bomba.hitbox.chocarCon(temporal))
        bomba.recienColocada = false;
    });
    return esSolido;
};
playerManager.mover = function(){
    if(animationManager.imagenes != null && this.personajes[this.id]!= null){
        if(keys[68] && !playerManager.solido(this.personajes[this.id].vel , 0, this.personajes[this.id])){
            this.personajes[this.id].dir = dir.DERECHA;
            this.personajes[this.id].animaciones.stop = false;
            io.emit('mover', this.personajes[this.id].dir, false);
            this.emitStop = true;
        }
        else if(keys[65] && !playerManager.solido(-this.personajes[this.id].vel , 0, this.personajes[this.id])){
            this.personajes[this.id].dir = dir.IZQUIERDA;
            this.personajes[this.id].animaciones.stop = false;
            io.emit('mover', this.personajes[this.id].dir, false);
            this.emitStop = true;
        }
        else if(keys[87] && !playerManager.solido(0 , -this.personajes[this.id].vel, this.personajes[this.id])){
            this.personajes[this.id].dir = dir.ARRIBA;
            this.personajes[this.id].animaciones.stop = false;
            io.emit('mover', this.personajes[this.id].dir, false);
            this.emitStop = true;
        }
        else if(keys[83] && !playerManager.solido(0 , this.personajes[this.id].vel, this.personajes[this.id])){
            this.personajes[this.id].dir = dir.ABAJO;
            this.personajes[this.id].animaciones.stop = false;
            io.emit('mover', this.personajes[this.id].dir, false);
            this.emitStop = true;
        }else{
            this.personajes[this.id].animaciones.stop = true;
            if(this.emitStop){
                io.emit('mover', this.personajes[this.id].dir, true);
                this.emitStop = false;
            }
        }
    }
}
    
playerManager.copiar = function(data){
    let copia = new player(data.id, data.x, data.y, data.vel, data.personaje , data.posHitX, data.posHitY, data.anchoHit, data.altoHit, data.numBomb, data.timeBomb, data.largeBomb);
    return copia;
}

io.on('nuevoID', function(data){
    playerManager.id = data;
    playerManager.personajes[playerManager.id] = new player(playerManager.id, 250,100, 3, "lion",0, 45, 40, 20, 3, 3000, 3);
    io.emit("nuevoJugador", playerManager.personajes[playerManager.id]);
});
// por si entra otro jugador
io.on('nuevoJugador', function(data){
    let copia = playerManager.copiar(data);
    playerManager.personajes[data.id] = copia;
});

// recibe todos los jugadores en la sala
io.on('allplayers', function(data){
    let copia;
    data.forEach(element => {
        copia = playerManager.copiar(element);
        playerManager.personajes[copia.id] = copia;
    });
});
// recibe quien se mueve
io.on('actualizar', function(data){
    if(playerManager.personajes[data.id] != null){
        playerManager.personajes[data.id].igualar(data);
        if(playerManager.personajes[data.id].morir)
            delete playerManager.personajes[data.id];
    }else{
        console.log("No existe el jugador que se mueve");
    }
});
io.on('murio', function(data){
    delete playerManager.personajes[data.id];
});