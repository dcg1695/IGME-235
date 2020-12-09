// Character Class from PIXI Sprite
class Character extends PIXI.Sprite
{
    constructor(sprite = "images/Spaceship.png", x = 0, y = 0)
    {
        super(app.loader.resources[sprite].texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(0.3);
        this.x = x;
        this.y = y;
    }
}

// Circle Class from PIXI Graphics
class Circle extends PIXI.Graphics
{
    constructor(radius, color = 0xFFFF00, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
        this.color = color;
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    reflectX()
    {
        this.fwd.x *= -1;
    }
    reflectY()
    {
        this.fwd.y *= -1;
    }
}

// Bullet Class from PIXI Text
class Bullet extends PIXI.Text
{
    constructor(color1 = 0xFFFFFF, color2, x = 0, y = 0)
    {
        super();
        this.text = "♪";
        this.style = new PIXI.TextStyle({
            fill: color2,
            fontSize: 13,
            fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
            stroke: color1,
            strokeThickness: 5
        });
        this.x = x;
        this.y = y;

        // Variables
        this.fwd = { x:0, y:-1 }
        this.speed = 400;
        this.isAlive = true;
        this.color = color2;
        Object.seal(this);
    }

    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// Ammo Class from PIXI Text
class Ammo extends PIXI.Text
{
    constructor(text, color, x, y, isVisible)
    {
        super();
        this.text = text;
        this.style = new PIXI.TextStyle({
            fill: color,
            fontSize: 28,
            fontFamily: "Ineptic, 'Futura URW Medium', sans-serif",
            stroke: 0xFFFFFF,
            strokeThickness: 2
        });
        this.x = x;
        this.y = y;

        // Variables
        this.color = color;
        this.visible = isVisible;
        Object.seal(this);
    }
}