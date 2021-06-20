const MoveSpeed = 120
const JumpDist = 300
const BigJump = 450
let CurrentJump = JumpDist
const EnemySpeed = 20
const EnemyJump = 200
let isJumping = true
const fallDeath = 600

layers(['obj','ui'],'obj')  
  
const maps = [
  ['                          ',
  '                          ',
  '                          ',
  '                          ',
  '                          ',
  '   %  =%=*=               ',
  '                          ',
  '                 +-       ',
  '      ^   ^   ^  ()       ',
  'xxxxxxxxxxxxxxxxxxxxx   xx',
  ],
  [
    '£                              £',
    '£                              £',
    '£                              £',
    '£        @@@@@      s          £',
    '£                 s s s        £',
    '£               s s s s s    -+£',
    '£      !      s s s s s s    ()£',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
  ]
]

const lvlConfig = {
    width: 20,
    height: 20,
    '=' : [sprite('block'),'block', solid()],
    '^' : [sprite('evil shroom 1'), 'dangerous', solid()],
    'x' : [sprite('brick'),'brick', solid()],

    '(' : [sprite('pipeleft'), 'pipeLeft', scale(0.5), solid()],
    ')' : [sprite('pipe right'), 'pipeRight', scale(0.5), solid()],
    '+' : [sprite('pipe top left'), 'pipe', scale(0.5), solid()],
    '-' : [sprite('pipe top right'), 'pipe', scale(0.5), solid()],

    '$' : [sprite('coin'),'coin'],
    '%' : [sprite('question'),'coinSurprise', solid()],
    '*' : [sprite('question'),'mushroomSurprise', solid()],
    '#' : [sprite('mushroom'),'mushroom',body()],
    '}' : [sprite('unboxed'),'unboxed', solid()],

    '£' : [sprite('blue brick'), solid(),scale(0.5)],
    'z' : [sprite('blueblock'), solid(), scale(0.5)], 
    '@' : [sprite('blue surprise'), solid(), scale(0.5), 'coinSurprise'],
    '!' : [sprite('blue evil shroom'), 'dangerous', scale(0.5)],
    's' : [sprite('blue steel'), solid(), scale(0.5)],  
}

const levelIndex = args.level ?? 0 
const gameLevel = addLevel(maps[levelIndex],lvlConfig)
const scoreGlobal = args.score ?? 0
const scoreLabel = add([
    text(scoreGlobal),
    pos(30,6),
    scale(1.5),
    {
      value: scoreGlobal,
    }
])

add([text('level ' +  parseInt(levelIndex + 1)), pos(45,6)])

function big() {
  let timer = 0
  let isBig = false
  return {
    update() {
      if (isBig) {
        timer -=dt()
        if (timer <=0) {
          this.smallify()
        }
      }
    },
    isBig() {
      return isBig
    },
    smallify() {
      this.scale = vec2(1)
      timer = 0
      isBig = false
      CurrentJump = JumpDist
      
    },
    biggify(time) {
      this.scale = vec2(2)
      timer = time
      isBig = true
      CurrentJump = BigJump
      
    }
  }
}

const player = add([
    sprite('mario standing'), 
    pos(20,0),
    body(),
    big(),
    origin('bot')
])

keyDown('left',() => {
  player.move(-MoveSpeed,0)
})

keyDown('right',() => {
  player.move(MoveSpeed,0)
})

keyDown('up',() => {
  if(player.grounded()){
    isJumping = true
    player.jump(CurrentJump)
  }
})

player.collides('dangerous', (d) => {
  if (isJumping){
    destroy(d)
  }
  else{
    go('lose', {score: scoreLabel.value})
    scoreLabel.text = scoreLabel.value
  }
})

player.action(() => {
    if(player.grounded()) {
      isJumping = false
    }
})

player.action( () =>{
  camPos(player.pos)
  if (player.pos.y >= fallDeath) {
    go('lose', { score: scoreLabel.value })
  }
})

player.on('headbump', (obj) => {
  if(obj.is('coinSurprise')){
    gameLevel.spawn('$', obj.gridPos.sub(0,1))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
  if(obj.is('mushroomSurprise')){
    gameLevel.spawn('#', obj.gridPos.sub(0,1))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0,0))
  }
})

action('mushroom', (m) => {
  m.move(20,0)
})

player.collides('mushroom', (m) => {
  destroy(m)
  player.biggify(6)
})

player.collides('coin', (c) => {
  scoreLabel.value++
  scoreLabel.text = scoreLabel.value
  destroy(c)
})

action('dangerous', (d) => {
  d.move(-EnemySpeed,0)
})

player.collides('pipe', () => {
  keyPress('down', () => {
    go('main', {
      level: (levelIndex + 1) % maps.length,
      score: scoreLabel.value
    })
  })
})

  