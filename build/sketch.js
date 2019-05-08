var blueLaserImg;
var redLaserImg;
var flashImg;
var explosionImg;

var explosionSprite;
var backdropSprite;
var wallTop;
var wallBottom;
var playerShipSprite;
var bossShipSprite;

var blueLasers;
var redLasers;

var gameOver = false;
var startTime = new Date();
var bossInvincible = true;

function preload()
{
    blueLaserImg = loadImage('img/laserBlue03.png');
    redLaserImg = loadImage('img/laserRed03.png');
    flashImg = loadImage('img/flash00.png');
    explosionImg = loadImage('img/explosion00.png');
}

function setup()
{
    createCanvas(480, 360);

    backdropSprite = createSprite(width/2, height/2, 480, 360);
    backdropSprite.addImage('backdrop', loadImage('img/blue2.png'));

    let wallThickness = 4;
    wallTop = createSprite(width/2, -50-wallThickness/2, width, wallThickness);
    wallTop.immovable = true;

    wallBottom = createSprite(width/2, 50+height+wallThickness/2, width, wallThickness);
    wallBottom.immovable = true;

    setupPlayerShip();

    setupBossShip();

    blueLasers = new Group();
    redLasers = new Group();
}

function setupPlayerShip()
{
    playerShipSprite = createSprite(width/2, 0+180+150, 50, 50);
    playerShipSprite.addImage('ship', loadImage('img/playerShip2_blue_halfScaled.png'));
    playerShipSprite.health = 100;
    playerShipSprite.immovable = true;

    playerShipSprite.moveSpeed = 5;

    playerShipSprite.input = function()
    {
        if(keyDown('a') && !playerShipSprite.overlapPoint(playerShipSprite.moveSpeed, playerShipSprite.position.y))
        {
            playerShipSprite.position.x -= playerShipSprite.moveSpeed;
        }
    
        if(keyDown('d') && !playerShipSprite.overlapPoint(width-playerShipSprite.moveSpeed, playerShipSprite.position.y))
        {
            playerShipSprite.position.x += playerShipSprite.moveSpeed;
        }
    
        if(keyWentDown(' '))
        {
            createBlueLaserSprite();
        }
    
    }

    playerShipSprite.explode = explode;
}


function explode()
{
    this.visible = false;
    if(explosionSprite == null)
    {
        explosionSprite = createSprite(this.position.x, this.position.y, 50, 50);
        explosionSprite.addImage('explosion', explosionImg);
        explosionSprite.scale = 0.2;
        setTimeout(function(){explosionSprite.remove();}, 0.2*1000);
    }
}

function setupBossShip()
{
    bossShipSprite = createSprite(width/2, 180-120, 50, 50);
    bossShipSprite.addImage('boss', loadImage('img/enemyBlack1.png'));
    bossShipSprite.immovable = true;

    bossShipSprite.moveSpeed = 2;
    bossShipSprite.health = 200;
    bossShipSprite.fireRate = 0.5;

    bossShipSprite.followPlayer = function()
    {
        if(playerShipSprite.position.x < bossShipSprite.position.x)
        {
            bossShipSprite.position.x -= bossShipSprite.moveSpeed;
        }

        if(playerShipSprite.position.x > bossShipSprite.position.x)
        {
            bossShipSprite.position.x += bossShipSprite.moveSpeed;
        }
    }

    bossShipSprite.shootTimer = new Date();
    bossShipSprite.shoot = function()
    {
        let now = new Date();
        if((now - bossShipSprite.shootTimer) > bossShipSprite.fireRate * 1000)
        {
            let redLaserSprite = createSprite(bossShipSprite.position.x, bossShipSprite.position.y+40, 50, 50);
            redLaserSprite.addImage('redLaser', redLaserImg);
            redLaserSprite.scale = 1;
            redLaserSprite.setSpeed(5, 90);

            redLasers.add(redLaserSprite);

            bossShipSprite.shootTimer = now;
        }
    }

    bossShipSprite.explode = explode;
/*
    bossShipSprite.death = function()
    {
        if(bossShipSprite.health <= 0)
        {
            bossShipSprite.visible = false;
        }
    }*/

    bossShipSprite.shakeCount = 0;
    bossShipSprite.maxShakes = 20;
    bossShipSprite.shakeTimer = new Date();
    bossShipSprite.shakeChange = 5;
    bossShipSprite.shake = function()
    {
        let now = new Date();

        //0.1 sec has passed
        if(((now - bossShipSprite.shakeTimer) > 0.1*1000) && bossShipSprite.shakeCount < bossShipSprite.maxShakes)
        {           
            bossShipSprite.position.x += bossShipSprite.shakeChange;

            bossShipSprite.shakeChange = -bossShipSprite.shakeChange;
            bossShipSprite.shakeCount++;
            bossShipSprite.shakeTimer = now;
        }
    }

}

function draw()
{
    background(200);

    let now = new Date();

    if(!gameOver)
    {
        if(playerShipSprite.health <= 0)
        {
            gameOver = true;
            playerShipSprite.explode();
            playerShipSprite.visible = false;
        }
        else
        {
            playerShipSprite.input();

            blueLasers.overlap(bossShipSprite, laserHitBoss);

            redLasers.collide(wallBottom, laserWallHit);
            redLasers.overlap(playerShipSprite, laserHitPlayer);
        }

        if(now - startTime > 3 * 1000)
        {
            bossInvincible = false;
            if(bossShipSprite.health <= 0)
            {
                gameOver = true;
            }
            else
            {
                bossShipSprite.followPlayer();
                bossShipSprite.shoot();
            }
        }
    }
    else
    {
        if(bossShipSprite.health <= 0)
        {
            bossShipSprite.shake();
            if(bossShipSprite.shakeCount == bossShipSprite.maxShakes)
            {
                bossShipSprite.explode();
                bossShipSprite.visible = false;
            }
        }
    }

    drawSprites();

    //health display
    push();
    textSize(16);
    fill(255, 255, 255);

    text(bossShipSprite.health, 15, 25);

    text(playerShipSprite.health, 15, height-12);

    pop();
}

function createBlueLaserSprite()
{
    let blueLaserSprite = createSprite(playerShipSprite.position.x-1, playerShipSprite.position.y-31, 50, 50);
    blueLaserSprite.addImage('laser', blueLaserImg);
    blueLaserSprite.scale = 0.5;
    blueLaserSprite.setSpeed(5, -90);

    blueLasers.add(blueLaserSprite);
}

function laserWallHit(laser, wall)
{
    laser.remove();
}


function laserHitBoss(laser, bossShip)
{
    if(bossShip.overlapPixel(laser.position.x-laser.width*laser.scale/2, laser.position.y-laser.height*laser.scale/2) ||
    bossShip.overlapPixel(laser.position.x+laser.width*laser.scale/2, laser.position.y-laser.height*laser.scale/2))
    {
        createFlashSprite(laser.position.x, laser.position.y);

        if(bossInvincible == false && bossShipSprite.health-10 >= 0 && !gameOver)
        {
            bossShipSprite.health -= 10;
        }

        laser.remove();
    }
}

function laserHitPlayer(laser, playerShip)
{
    if(playerShip.overlapPixel(laser.position.x-laser.width*laser.scale/2, laser.position.y+laser.height*laser.scale/2) ||
    playerShip.overlapPixel(laser.position.x+laser.width*laser.scale/2, laser.position.y+laser.height*laser.scale/2))
    {
        if(bossShipSprite.health-20 >= 0 && !gameOver)
        {
            playerShipSprite.health -= 20;
        }
        laser.remove();
    }
}

function createFlashSprite(x, y)
{
    let flashSprite = createSprite(x, y, 50, 50);
    flashSprite.addImage('flash', flashImg);
    flashSprite.scale = 0.05;
    setTimeout(function(){flashSprite.remove();}, 10);
}