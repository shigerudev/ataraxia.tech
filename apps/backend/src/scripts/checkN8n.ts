import { N8nClient } from '../infrastructure/automation/N8nClient.js';

const client = new N8nClient();

if (!client.isConfigured()) {
  throw new Error('Define N8N_BASE_URL y N8N_API_KEY en apps/backend/.env');
}

const workflows = await client.listWorkflows();
console.log(`n8n conectado. Workflows visibles: ${workflows.length}`);
for (const workflow of workflows.slice(0, 10)) {
  console.log(`- ${workflow.active ? 'active' : 'inactive'} ${workflow.name} (${workflow.id})`);
}
