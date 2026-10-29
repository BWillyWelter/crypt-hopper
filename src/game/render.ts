import { FLOOR, HEIGHT, PIPE_WIDTH, type Flight } from './physics'

export type Scene = {
  flight: Flight
  time: number
  idle: boolean
  dead: boolean
  impact: number
  particles: { x: number; y: number; life: number; vx: number; vy: number }[]
}
const TAU = Math.PI * 2
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string | CanvasGradient,
) {
  c.fillStyle = color
  c.beginPath()
  c.ellipse(x, y, rx, ry, 0, 0, TAU)
  c.fill()
}
function round(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}

export function drawMonster(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  time: number,
  scale = 1,
  dead = false,
) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)

  // Pointed tail and clawed feet give the crypt monster a mischievous shape.
  c.fillStyle = '#53336f'
  c.beginPath()
  c.moveTo(-15, 4)
  c.quadraticCurveTo(-37, 3, -36, -8)
  c.quadraticCurveTo(-26, -11, -19, -5)
  c.lineTo(-11, -9)
  c.closePath()
  c.fill()
  c.strokeStyle = '#e8b96a'
  c.lineWidth = 2
  c.lineCap = 'round'
  for (const offset of [-7, 8]) {
    c.beginPath()
    c.moveTo(offset, 12)
    c.lineTo(offset - 3, 18)
    c.lineTo(offset + 2, 17)
    c.stroke()
  }

  // Two curled horns, with warm ivory tips.
  c.strokeStyle = '#714492'
  c.lineWidth = 7
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-9, -11)
  c.quadraticCurveTo(-16, -22, -19, -25)
  c.moveTo(7, -12)
  c.quadraticCurveTo(16, -22, 13, -28)
  c.stroke()
  c.strokeStyle = '#efce91'
  c.lineWidth = 2.2
  c.beginPath()
  c.moveTo(-19, -24)
  c.lineTo(-18, -29)
  c.moveTo(13, -26)
  c.lineTo(16, -30)
  c.stroke()

  const body = c.createLinearGradient(-15, -18, 17, 20)
  body.addColorStop(0, '#c386df')
  body.addColorStop(1, '#8050a8')
  ellipse(c, 0, 0, 23, 19, body)
  ellipse(c, -2, 10, 13, 7, '#c399d4')

  // Three bright eyes: this crypt critter definitely has too many.
  const eyes = [[-5, -7], [8, -8], [12, 3]] as const
  for (const [eyeX, eyeY] of eyes) {
    ellipse(c, eyeX, eyeY, 5, 5.5, '#f5dda0')
    if (dead) {
      c.strokeStyle = '#50385a'
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(eyeX - 2, eyeY - 2)
      c.lineTo(eyeX + 2, eyeY + 2)
      c.moveTo(eyeX + 2, eyeY - 2)
      c.lineTo(eyeX - 2, eyeY + 2)
      c.stroke()
    } else {
      ellipse(c, eyeX + 1, eyeY, 1.6, 2.7, '#392745')
      ellipse(c, eyeX + 1.6, eyeY - 1.2, 0.65, 0.8, '#fff8e5')
    }
  }

  // A tiny grin with two visible fangs.
  c.strokeStyle = '#4e315e'
  c.lineWidth = 1.5
  c.beginPath()
  c.moveTo(12, 10)
  c.quadraticCurveTo(17, 13, 21, 8)
  c.stroke()
  c.fillStyle = '#fff0c9'
  c.beginPath()
  c.moveTo(15, 10)
  c.lineTo(16, 14)
  c.lineTo(18, 11)
  c.moveTo(19, 9)
  c.lineTo(20, 12)
  c.lineTo(22, 8)
  c.fill()

  c.save()
  c.translate(-8, 2)
  c.rotate(-0.25 + Math.sin(time * 20) * (dead ? 0 : 0.42))
  ellipse(c, -3, 3, 9, 5, '#70458c')
  c.strokeStyle = '#d9a9ed'
  c.lineWidth = 1.3
  c.beginPath()
  c.ellipse(-4, 1, 7, 3, 0.1, 3.2, 5.8)
  c.stroke()
  c.restore()
  c.restore()
}

function cloud(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
) {
  c.save()
  c.translate(x, y)
  c.scale(size, size)
  c.globalAlpha = opacity
  c.fillStyle = '#d5c6da'
  c.beginPath()
  c.moveTo(-50, 14)
  c.bezierCurveTo(-65, 13, -62, -10, -40, -12)
  c.bezierCurveTo(-39, -42, 4, -45, 14, -20)
  c.bezierCurveTo(35, -26, 50, -7, 43, 3)
  c.bezierCurveTo(66, 0, 68, 22, 45, 22)
  c.lineTo(-42, 22)
  c.quadraticCurveTo(-54, 21, -50, 14)
  c.fill()
  c.restore()
}

function hills(
  c: CanvasRenderingContext2D,
  width: number,
  offset: number,
  y: number,
  color: string,
  period: number,
  height: number,
) {
  c.fillStyle = color
  c.beginPath()
  c.moveTo(-period, HEIGHT)
  const start = -(offset % period) - period
  c.lineTo(start, y)
  for (let x = start; x < width + period; x += period) {
    c.bezierCurveTo(
      x + period * 0.2,
      y,
      x + period * 0.22,
      y - height,
      x + period * 0.5,
      y - height,
    )
    c.bezierCurveTo(
      x + period * 0.78,
      y - height,
      x + period * 0.8,
      y,
      x + period,
      y,
    )
  }
  c.lineTo(width + period, HEIGHT)
  c.closePath()
  c.fill()
}

function pipe(
  c: CanvasRenderingContext2D,
  x: number,
  edge: number,
  top: boolean,
) {
  const w = PIPE_WIDTH - 10,
    start = top ? -25 : edge,
    end = top ? edge : FLOOR + 10
  const grad = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
  grad.addColorStop(0, '#31243d')
  grad.addColorStop(0.24, '#554064')
  grad.addColorStop(0.46, '#674b73')
  grad.addColorStop(0.8, '#493458')
  grad.addColorStop(1, '#2c2039')
  c.fillStyle = '#170f23'
  round(c, x - w / 2 - 2, start, w + 4, end - start, 6)
  c.fill()
  c.fillStyle = grad
  round(c, x - w / 2, start, w, end - start, 5)
  c.fill()
  c.strokeStyle = '#bb91c4'
  c.globalAlpha = 0.44
  c.lineWidth = 1.5
  for (let y = start + 30; y < end - 12; y += 58) {
    c.beginPath()
    c.moveTo(x - 19, y)
    c.lineTo(x - 19, y + 15)
    c.lineTo(x + 19, y + 15)
    c.lineTo(x + 19, y + 29)
    c.stroke()
  }
  c.globalAlpha = 1
  const capY = top ? edge - 27 : edge
  c.fillStyle = '#21162d'
  round(c, x - PIPE_WIDTH / 2, capY, PIPE_WIDTH, 28, 7)
  c.fill()
  c.fillStyle = grad
  round(c, x - PIPE_WIDTH / 2 + 2, capY + 2, PIPE_WIDTH - 4, 23, 5)
  c.fill()
  c.fillStyle = '#ac84ad'
  c.globalAlpha = 0.8
  round(c, x - PIPE_WIDTH / 2 + 7, capY + 3, PIPE_WIDTH - 14, 2, 1)
  c.fill()
  c.globalAlpha = 1
  // Watchful eyes set into the crypt stones.
  for (const eyeX of [x - 14, x, x + 14]) {
    ellipse(c, eyeX, capY + 15, 3.6, 4.2, '#e6bd70')
    ellipse(c, eyeX + 0.4, capY + 15, 1.2, 2.5, '#37223e')
  }
  // Ivory fangs face the narrow passage without changing the collision path.
  c.fillStyle = '#f1d8ab'
  c.beginPath()
  if (top) {
    for (const toothX of [x - 19, x, x + 19]) {
      c.moveTo(toothX - 5, edge - 1)
      c.lineTo(toothX, edge + 6)
      c.lineTo(toothX + 5, edge - 1)
    }
  } else {
    for (const toothX of [x - 19, x, x + 19]) {
      c.moveTo(toothX - 5, edge + 1)
      c.lineTo(toothX, edge - 6)
      c.lineTo(toothX + 5, edge + 1)
    }
  }
  c.fill()
}

export function render(
  c: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
) {
  const scale = height / HEIGHT,
    w = width / scale
  c.save()
  c.scale(scale, scale)
  const { flight, time, idle } = scene
  const travel = idle ? time * 19 : flight.distance
  const monsterX = idle ? w * 0.5 : Math.min(w * 0.3, 350)
  const sky = c.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#171323')
  sky.addColorStop(0.55, '#272038')
  sky.addColorStop(1, '#48304f')
  c.fillStyle = sky
  c.fillRect(0, 0, w, HEIGHT)
  const sunX = w * 0.78,
    sunY = 115
  const halo = c.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150)
  halo.addColorStop(0, '#f5d99177')
  halo.addColorStop(1, '#f5d99100')
  c.fillStyle = halo
  c.fillRect(sunX - 150, sunY - 150, 300, 300)
  ellipse(c, sunX, sunY, 38, 38, '#eed391')
  for (let i = 0; i < 7; i++) {
    const x =
      ((((i * 287 + 80 - travel * 0.15) % (w + 300)) + w + 300) % (w + 300)) -
      150
    cloud(c, x, 100 + ((i * 61) % 170), 0.65 + (i % 3) * 0.3, 0.19)
  }
  // A small flock of ghostly bats crosses the distant moonlight.
  c.strokeStyle = '#d8bfdc'
  c.lineWidth = 1.4
  c.globalAlpha = 0.6
  for (let i = 0; i < 3; i++) {
    const x = w * 0.65 + i * 19 - travel * 0.025,
      y = 225 + (i % 2) * 9
    c.beginPath()
    c.moveTo(x - 6, y - 2)
    c.quadraticCurveTo(x - 4, y - 5, x - 2, y - 1)
    c.lineTo(x, y - 4)
    c.lineTo(x + 2, y - 1)
    c.quadraticCurveTo(x + 4, y - 5, x + 6, y - 2)
    c.stroke()
  }
  c.globalAlpha = 1
  hills(c, w, travel * 0.12, 478, '#352743', 620, 160)
  hills(c, w, travel * 0.23 + 170, 530, '#49334f', 470, 128)
  hills(c, w, travel * 0.38 + 80, 571, '#63485d', 350, 100)
  // Soft tree line and scattered foliage.
  for (let i = 0; i < Math.ceil(w / 82) + 3; i++) {
    const x = i * 82 - ((travel * 0.55) % 82),
      h = 23 + ((i + Math.floor((travel * 0.55) / 82)) % 3) * 15
    c.fillStyle = '#69506a'
    c.beginPath()
    c.moveTo(x, 570)
    c.lineTo(x + 16, 570 - h)
    c.lineTo(x + 32, 570)
    c.fill()
  }
  if (idle) {
    const x = w < 650 ? w + 10 : w * 0.84
    pipe(c, x, 223, true)
    pipe(c, x, 430, false)
    if (w > 850) {
      pipe(c, w * 0.12 - 15, 110, true)
      pipe(c, w * 0.12 - 15, 393, false)
    }
  } else {
    for (const p of flight.pipes) {
      const x = monsterX + p.x - flight.distance
      if (x < -70 || x > w + 70) continue
      pipe(c, x, p.center - p.gap / 2, true)
      pipe(c, x, p.center + p.gap / 2, false)
      if (!p.eyeCollected) {
        c.save()
        c.shadowColor = '#f3d77b'
        c.shadowBlur = 18
        ellipse(c, x, p.eyeY, 7, 9, '#f6d879')
        ellipse(c, x + 1, p.eyeY, 2, 5, '#38223d')
        ellipse(c, x - 1, p.eyeY - 3, 1.5, 1.5, '#fff8df')
        c.restore()
      }
    }
  }
  // Ground never moves vertically; parallax is drawn inside the same canvas.
  c.fillStyle = '#20162b'
  c.fillRect(0, FLOOR, w, 56)
  c.fillStyle = '#936c87'
  c.fillRect(0, FLOOR + 3, w, 8)
  c.fillStyle = '#433249'
  c.fillRect(0, FLOOR + 11, w, 45)
  c.fillStyle = '#594258'
  c.fillRect(0, FLOOR + 13, w, 3)
  for (let i = 0; i < w / 30 + 2; i++) {
    const x = i * 30 - (travel % 30)
    c.fillStyle = '#765876'
    round(
      c,
      x,
      FLOOR + 26 + ((i + Math.floor(travel / 30)) % 2) * 11,
      10,
      3,
      1.5,
    )
    c.fill()
  }
  for (let i = 0; i < w / 78 + 2; i++) {
    const x = i * 78 - (travel % 78)
    c.fillStyle = '#35243d'
    c.beginPath()
    c.moveTo(x - 10, FLOOR + 2)
    c.lineTo(x - 8, FLOOR - 13)
    c.lineTo(x - 2, FLOOR - 18)
    c.lineTo(x + 4, FLOOR - 13)
    c.lineTo(x + 6, FLOOR + 2)
    c.closePath()
    c.fill()
    if ((i + Math.floor(travel / 78)) % 3 === 1) {
      ellipse(c, x - 2, FLOOR - 8, 1.5, 1.8, '#e7bd74')
    }
  }
  if (!idle) {
    for (const p of scene.particles) {
      c.globalAlpha = Math.max(0, p.life)
      ellipse(
        c,
        monsterX + p.x - flight.distance,
        p.y,
        2.8 * p.life,
        2.8 * p.life,
        '#eecb8d',
      )
    }
    c.globalAlpha = 1
  }
  const y = idle ? 324 + Math.sin(time * 2.8) * 9 : flight.y
  ellipse(c, monsterX, FLOOR + 5, 23, 4, '#08050d66')
  const angle = idle
    ? -0.08
    : Math.max(-0.4, Math.min(1.3, flight.velocity / 550))
  drawMonster(c, monsterX, y, angle, time, idle ? 1.8 : 1, scene.dead)
  if (scene.impact > 0) {
    c.fillStyle = `rgba(255,248,222,${scene.impact * 0.3})`
    c.fillRect(0, 0, w, HEIGHT)
  }
  c.restore()
}
