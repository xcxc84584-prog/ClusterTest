/**
 * Compress continuous-loop PASS events to START and END.
 * Every FAIL and EHU is always retained.
 * No implicit timeout or loss of terminal events.
 */
export class LoopLogUnit {
  constructor(omu) {
    this.omu = omu;
    this.active = new Map();
  }
  start({ loopId, source, action }) {
    if (!loopId || this.active.has(loopId)) {
      throw new Error('Invalid or duplicate loopId');
    }
    this.active.set(loopId, { source, action });
    return this.omu.record({
      source, action, loopId, phase: 'START', result: 'PASS'
    });
  }
  step({ loopId, result = 'PASS', kind = 'LOG', code }) {
    const loop = this.active.get(loopId);
    if (!loop) throw new Error('Unknown loopId');
    if (result === 'PASS' && kind !== 'EHU') return null;
    return this.omu.record({
      ...loop, loopId, phase: 'STEP', kind, result, code
    });
  }
  end({ loopId, result = 'PASS', code }) {
    const loop = this.active.get(loopId);
    if (!loop) throw new Error('Unknown loopId');
    this.active.delete(loopId);
    return this.omu.record({
      ...loop, loopId, phase: 'END', result, code
    });
  }
  activeLoops() { return [...this.active.keys()]; }
}
