// ============================================================================
// Ataraxia — Seed de usuarios (fuente de verdad)
// ----------------------------------------------------------------------------
// Este script es idempotente: se ejecuta en CADA `up` mediante el servicio
// `mongo-seed`. Usa upserts, por lo que no duplica ni sobrescribe datos ya
// modificados de forma inesperada.
//
// Las contraseñas se almacenan encriptadas con bcrypt (salt rounds = 10).
// Contraseña en claro de todos los usuarios de ejemplo: "Ataraxia2024!"
//
// Para regenerar un hash:
//   node -e "console.log(require('bcryptjs').hashSync('NUEVA_PASS', 10))"
// ============================================================================

const PASSWORD_HASH = '$2a$10$biy5IiRteDbTNOPH4Rbsj.BAoUNvdIXOPf/LsvJNDnCBy0eDl41RK';

const users = [
  {
    id: 'usr-001',
    email: 'psicologo@ataraxia.tech',
    name: 'Dra. Ana García',
    role: 'psychologist',
    passwordHash: PASSWORD_HASH,
  },
  {
    id: 'usr-002',
    email: 'paciente@ataraxia.tech',
    name: 'María López',
    role: 'patient',
    passwordHash: PASSWORD_HASH,
  },
  {
    id: 'usr-003',
    email: 'admin@ataraxia.tech',
    name: 'Administración Ataraxia',
    role: 'admin',
    passwordHash: PASSWORD_HASH,
  },
];

db.users.createIndex({ email: 1 }, { unique: true });

for (const user of users) {
  db.users.updateOne(
    { id: user.id },
    {
      $set: {
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
      },
    },
    { upsert: true },
  );
}

print(`[seed] users: ${db.users.countDocuments()} documento(s)`);
