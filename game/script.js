//объявление нужных переменных
let game = new Phaser.Scene('game');
let score = 0;
let scoreText;
let newobj;
let player;
// Метод Preload, предварительно загружает все объекты для игры.
game.preload = function () {
  this.load.image('galaxy', 'img/galaxy.png');
  this.load.image('gold', 'img/ruby_0000.png');
  this.load.image('ship', 'img/ship.png');
  this.load.spritesheet('dude', 'img/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  });
}
// Метод Create, создаёт все объекты
game.create = function () {
  scrore = 0; // обнуление счётчика очков
  this.add.image(400, 300, 'galaxy'); // добавление фона
  // добавление персонажа с физикой strart
  player = this.physics.add.sprite(400, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  // добавление персонажа с физикой end

  //добавление кристаллов в случайных местах start
  stars = this.physics.add.staticGroup({});
  for (i = 0; i < 20; i++) {
    let x = Phaser.Math.RND.between(0, 800);
    let y = Phaser.Math.RND.between(0, 600);
    newobj = stars.create(x, y, 'gold');
  }
  //добавление кристаллов в случайных местах end

  // Анимация движения персонажа влево, используется 4 кадра
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 0,//начало кадров
      end: 3 // конец кадров, используется 4 кадра
    }),
    frameRate: 10,// кол-во кадров
    repeat: -1 //зацикливание
  });
  // Анимация поворота персонажа к камере. используется один кадр
  this.anims.create({
    key: 'turn',
    frames: [{
      key: 'dude',
      frame: 4
    }],
    frameRate: 20
  });
  // Анимация разворота персонажа. используется 4 кадра
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 5,
      end: 8
    }),
    frameRate: 10,
    repeat: -1
  });
  // создание врагов
  this.ships = this.add.group({
    key: 'ship',
    repeat: 9, //кол-во врагов
    setXY: {
      //начальные координаты
      x: 50,
      y: 100,
      // отступы между врагами
      stepX: 80,
      stepY: 20
    }
  });
  Phaser.Actions.ScaleXY(this.ships.getChildren(), -0.5, -0.5);//размер врагов
  //скорость врагов
  Phaser.Actions.Call(this.ships.getChildren(), function (enemy) {
    enemy.speed = Math.random() * 1 + 0.5;
  }, this);
  cursors = this.input.keyboard.createCursorKeys();// функция для использования клавиатуры
  this.physics.add.overlap(player, stars, points);// функция для проверки пересечения с кристаллом
  // добавление счётчика очков
  scoreText = this.add.text(16, 16, 'Счёт: 0', {
    fontSize: '32px',
    fill: '#000'
  });
  this.isPlayerAlive = true;//игрок в нчале игры жив
  this.cameras.main.resetFX();// для анимации затухания
}

game.update = function () {
  //нажата кнопка влево- перемещаемся влево
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
    player.anims.play('left', true);
  //нажата кнопка вправо- перемещаемся вправо
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
    player.anims.play('right', true);
  //не нажаты кнопки - разворот к камере
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }
  //нажата кнопка вверх- поднимаемся
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  }
  //нажата кнопка вниз- падаем с большей скоростью
  //так как в физике изначально заложена анимация падения
  //если кнопки не нажаты
  if (cursors.down.isDown) {
    player.setVelocityY(200);
  }
  //логика движения врагов, столкновения с ними, условие победы start
  let ships = this.ships.getChildren();
  let masLenght = ships.length;

  for (let i = 0; i < masLenght; i++) {

    ships[i].y += ships[i].speed;//перемещение врагов
    
    // если враг достигает границы, то он начинает двигаться обратно
    if (ships[i].y >= 600 && ships[i].speed > 0) {
      ships[i].speed *= -1;
    } else if (ships[i].y <= 10 && ships[i].speed < 0) {
      ships[i].speed *= -1;
    }
    
    //уловие столкновения с врагом
    // если прямоугольник игрока и врага пересакается, тогда
    //обнуляем счётчик очков и вызываем функцию окончания игры
    // Использованы встроенные функции Phaser 3
    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), ships[i].getBounds())) {
        score = 0;
        this.gameOver();
        break;
    }
  }
  //Если набрано необходимое кол-во очков, то вызываем функцию окончания игры
  //Находится вне цикла, тк не имеет отношения к врагам
  if (score === 20){
    score = 0;
    this.winGame();
  }
  //логика движения врагов, столкновения с ними, условие победы end
}

//функция увеличения кол-ва очков
function points(player, stars) {
  stars.disableBody(true, true);
  score += 1;
  scoreText.setText('Счёт: ' + score);
}

//функция победы в игре
game.winGame = function (){
  score == 0;
  this.isPlayerAlive = false;
  this.time.delayedCall(250, function () {
    this.cameras.main.fade(600);
  }, [], this);
  this.time.delayedCall(2300, function () {
      this.scene.restart();
    },
    [], this);
    
}

//функция поражения в игре
game.gameOver = function () {
    score == 0;
    this.isPlayerAlive = false;
  this.cameras.main.shake(500);
  this.time.delayedCall(250, function () {
    this.cameras.main.fade(250);
  }, [], this);
  this.time.delayedCall(500, function () {
      this.scene.restart();
    },
      [], this);
}

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: game
};
let myGame = new Phaser.Game(config);