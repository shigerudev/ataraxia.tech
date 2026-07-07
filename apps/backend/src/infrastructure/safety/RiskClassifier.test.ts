import assert from 'node:assert/strict';
import test from 'node:test';
import { RiskClassifier } from './RiskClassifier.js';
import type { ILlmService } from '../../domain/services/ILlmService.js';

class LowRiskLlm implements ILlmService {
  async chat(): Promise<string> {
    return 'low';
  }

  async *chatStream(): AsyncGenerator<string> {
    yield '';
  }
}

test('classifies passive suicidal ideation as high risk', async () => {
  const classifier = new RiskClassifier(new LowRiskLlm());

  await assertRisk(
    classifier,
    'Me he sentido muy cansado y siento que la vida ya no vale la pena.',
    'high',
  );
  await assertRisk(classifier, 'No vale la pena vivir.', 'high');
  await assertRisk(classifier, 'Quisiera no despertar mañana.', 'high');
});

test('does not force high risk for sadness without passive suicidal ideation', async () => {
  const classifier = new RiskClassifier(new LowRiskLlm());

  await assertRisk(classifier, 'Me siento triste y cansado.', 'low');
});

async function assertRisk(
  classifier: RiskClassifier,
  text: string,
  expected: 'low' | 'medium' | 'high',
): Promise<void> {
  const result = await classifier.classifyMessage(text);
  assert.equal(result.level, expected);
}
