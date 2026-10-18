/**
 * PigSquadAnimator - 2D 像素小豬們移動與戰鬥動畫獨立模組 (Agent 擴充範本)
 * 支援：待機呼吸(idle)、四蹄奔跑(walk)、彈跳(jump)、揮砍(attack)、愛心技能(skill)、受擊(hurt)
 * 以及多隻小豬列隊移動軌跡跟隨 (Squad Trail Following)
 */
export class PigSquadAnimator {
  constructor(squadSize = 3) {
    this.squadSize = squadSize;
    this.leader = { x: 160, y: 180, vx: 0, vy: 0, facing: 1, state: 'walk' };
    this.trailQueue = []; // 儲存領隊歷史座標供後方小豬們跟隨
    this.animTime = 0;
  }

  update(dt, inputDirX, isJumping, groundY = 180) {
    this.animTime += dt;
    const speed = 180;
    if (inputDirX !== 0) {
      this.leader.x += inputDirX * speed * dt;
      this.leader.facing = Math.sign(inputDirX);
      this.leader.state = 'walk';
    } else {
      this.leader.state = 'idle';
    }

    if (isJumping && this.leader.y >= groundY) {
      this.leader.vy = -380;
    }
    this.leader.vy += 920 * dt;
    this.leader.y = Math.min(groundY, this.leader.y + this.leader.vy * dt);
    if (this.leader.y < groundY) this.leader.state = 'jump';

    // 推進軌跡佇列，讓第 2~N 隻小豬產生平滑跟隨延遲
    this.trailQueue.unshift({
      x: this.leader.x,
      y: this.leader.y,
      facing: this.leader.facing,
      state: this.leader.state
    });
    if (this.trailQueue.length > 120) this.trailQueue.pop();
  }

  // 繪製整隊小豬們
  renderSquad(ctx, drawSinglePigFn) {
    for (let i = this.squadSize - 1; i >= 0; i--) {
      const frameDelay = Math.min(this.trailQueue.length - 1, i * 12);
      const pose = this.trailQueue[frameDelay] || this.leader;
      drawSinglePigFn(ctx, pose.x - pose.facing * (i * 18), pose.y, {
        scale: i === 0 ? 1.0 : 0.78,
        facing: pose.facing,
        state: pose.state,
        animTime: this.animTime,
        pigIndex: i,
        showHeartBubble: i === 0
      });
    }
  }
}