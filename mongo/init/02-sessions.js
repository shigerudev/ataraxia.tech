// ============================================================================
// Ataraxia — Seed de datos de ejemplo: sesiones de psicología
// ----------------------------------------------------------------------------
// Idempotente (upsert por `id`). Datos de muestra para desarrollo/demos.
// Ajusta o amplía aquí cualquier dato inicial de la instancia Mongo.
// ============================================================================

const sessions = [
  {
    id: 'ses-001',
    type: 'individual',
    title: 'Sesión individual de seguimiento',
    psychologistId: 'usr-001',
    patientId: 'usr-002',
    scheduledAt: new Date('2026-07-10T16:00:00Z'),
    status: 'scheduled',
  },
  {
    id: 'ses-002',
    type: 'group',
    title: 'Grupo de apoyo: manejo de la ansiedad',
    psychologistId: 'usr-001',
    patientId: null,
    scheduledAt: new Date('2026-07-12T18:00:00Z'),
    status: 'scheduled',
  },
];

db.sessions.createIndex({ id: 1 }, { unique: true });
db.sessions.createIndex({ psychologistId: 1 });

for (const session of sessions) {
  db.sessions.updateOne({ id: session.id }, { $set: session }, { upsert: true });
}

print(`[seed] sessions: ${db.sessions.countDocuments()} documento(s)`);
