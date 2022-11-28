// start PIXI app
const tileSize = 16;
const mapColumns = 31;
const mapRows = 20;
const mapWidth = tileSize * mapColumns;
const mapHeight = tileSize * mapRows;

const canvas = document.getElementById('game');
const renderer = new PIXI.Renderer({
  view: canvas,
  width: mapWidth,
  height: mapHeight,
  backgroundColor: '000000',
  resolution: window.devicePixelRatio,
  autoDensity: true,
});
const stage = new PIXI.Container();

const grassTypes = ['bulbasaur'];
const fireTypes = ['charmander'];

class Game {
  constructor() {
    this.selectedTower;
    this.timer = 0;
    this.towers = {
      grass: [],
      fire: [],
    };
    this.projectiles = [];
  }

  incrementTimer() {
    this.timer += 1;
  }

  selectTower(tower) {
    this.selectedTower = tower;
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
    stage.addChild(projectile.sprite);
  }

  handleGrassTowers() {
    if (this.towers.grass.length > 0 && this.timer % 50 === 0) {
      this.towers.grass.forEach((t) => {
        t.shoot();
      });
    }
  }

  handleProjectiles() {
    if (this.projectiles.length > 0 && this.timer % 25 === 0) {
      this.projectiles.forEach((p) => {
        p.move();
      });
    }
  }
}

const game = new Game();
const ticker = PIXI.Ticker.shared;
ticker.autoStart = false;
ticker.add((t) => animate(t));
ticker.start();

// create tiles
class Grid {
  constructor() {
    this.width = mapWidth;
    this.height = mapHeight;
    this.container = new PIXI.Container();
  }

  addChild(child) {
    this.container.addChild(child);
  }

  createTile(child, img) {
    const tile = new child(img);
    return tile;
  }

  createGrid({ child, img, rows, columns, tileSize }) {
    const tiles = [...Array(rows * columns).keys()].map((t) =>
      this.createTile(child, img)
    );

    let line = 1;
    tiles.forEach((tile, i) => {
      if (i === columns * line) {
        line += 1;
      }
      tile.sprite.x = tileSize * (i - (line - 1) * columns);
      tile.sprite.y = tileSize * (line - 1);
      this.addChild(tile.sprite);
    });
  }
}

class Tile {
  constructor(img) {
    this.img = img;
    this.sprite = PIXI.Sprite.from(this.img);
    this.sprite.interactive = true;
    this.sprite.on('pointerdown', this.addTower);
  }

  addTower(e) {
    if (game.selectedTower) {
      console.log(game.selectedTower);
      stage.addChild(game.selectedTower.sprite);
      game.towers[game.selectedTower.type].push(game.selectedTower);
      game.selectedTower.sprite.x = this.x;
      game.selectedTower.sprite.y = this.y;
      game.selectedTower = '';
      console.log(game.towers);
    }
  }
}

class Tower {
  constructor(monster) {
    this.monster = monster;
    this.sprite = PIXI.Sprite.from(`/img/${monster}.png`);
  }
}

class GrassTower extends Tower {
  constructor(monster) {
    super(monster);
    this.type = 'grass';
  }

  createProjectile() {
    const projectile = new GrassProjectile('grass');
    projectile.sprite.x = this.sprite.x;
    projectile.sprite.y = this.sprite.y;
    return projectile;
  }

  shoot() {
    game.addProjectile(this.createProjectile());
  }
}

class Fire extends Tower {}

class Projectile {
  shoot() {
    console.log('shoot!');
  }
}

class GrassProjectile extends Projectile {
  constructor(type) {
    super();
    this.type = type;
    this.sprite = PIXI.Sprite.from(`/img/${type}.png`);
  }

  move() {
    this.sprite.x -= tileSize;
  }
}

const grid = new Grid();
stage.addChild(grid.container);
const background = PIXI.Texture.from('/img/background.png');

background.on('pointerdown', (e) => {
  console.log('clicked!');
});
grid.createGrid({
  child: Tile,
  img: '/img/background.png',
  rows: mapRows,
  columns: mapColumns,
  tileSize: tileSize,
});

// for (let i = 0; i < 25; i++) {
//   const bunny = new PIXI.Sprite(background);
//   bunny.anchor.set(0.5);
//   bunny.x = (i % 5) * 40;
//   bunny.y = Math.floor(i / 5) * 40;
//   grid.addChild(bunny);
// }

// create pokémon sprites
const pokemon = ['bulbasaur, charmander, houndour, swablu, togepi'];

const bulbasaur = PIXI.Sprite.from('/img/bulbasaur.png');
bulbasaur.interactive = true;
bulbasaur.on('pointerdown', (event) => {
  game.selectTower(new GrassTower('bulbasaur'));
});
stage.addChild(bulbasaur);

const charmander = PIXI.Sprite.from('/img/charmander.png');
charmander.x = 0;
charmander.y = 16;
charmander.interactive = true;
charmander.on('pointerdown', (event) => {
  game.selectTower(new Fire('charmander'));
});
stage.addChild(charmander);

// Animate

function animate(t) {
  //console.log(game.towers);
  game.incrementTimer();
  game.handleGrassTowers();
  game.handleProjectiles();
  renderer.render(stage);
}
