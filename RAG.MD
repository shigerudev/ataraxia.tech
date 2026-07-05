# RAG knowledge map

Este archivo resume la informacion que Ataraxia tiene cargada o preparada para
consulta mediante RAG. Su objetivo es orientar al agente sobre que escenarios
psicologicos puede usar como contexto, que tipo de preguntas puede formular y
cuando debe escalar a apoyo humano o protocolo de crisis.

Ataraxia no debe usar este corpus para emitir diagnosticos definitivos,
prescribir medicamentos o sustituir atencion profesional. El RAG funciona como
apoyo de orientacion, triage, psicoeducacion y organizacion conversacional.

## Cobertura principal

### Evaluacion inicial

Fuente local:

- `apps/backend/knowledge/evaluation/initial-evaluation-framework.md`

El agente puede procesar:

- motivo principal de consulta;
- duracion, frecuencia e intensidad del malestar;
- impacto funcional en sueno, apetito, energia, concentracion, trabajo, estudio,
  relaciones y autocuidado;
- eventos precipitantes;
- red de apoyo;
- antecedentes de crisis;
- preguntas base para ordenar la conversacion;
- criterios generales de escalamiento.

Uso esperado:

- abrir una evaluacion conversacional;
- decidir si la persona puede continuar con apoyo automatizado;
- detectar si hace falta preguntar por riesgo, sustancias, trauma o apoyo humano.

### Crisis, autolesion y riesgo suicida

Fuente local:

- `apps/backend/knowledge/evaluation/crisis-and-self-harm-assessment.md`

El agente puede procesar:

- ideacion suicida;
- deseos de desaparecer o no seguir viviendo;
- autolesion actual o reciente;
- plan, intencion, medios disponibles y acceso a metodos letales;
- desesperanza, aislamiento, impulsividad o intoxicacion;
- riesgo de dano a otras personas;
- necesidad de activar protocolo de crisis.

Uso esperado:

- priorizar seguridad antes de cualquier ejercicio conversacional;
- preguntar por presencia de alguien confiable;
- recomendar ayuda urgente cuando haya plan, medios, intencion o peligro actual.

### Depresion, ansiedad y funcionamiento

Fuente local:

- `apps/backend/knowledge/evaluation/depression-anxiety-functional-assessment.md`

El agente puede procesar:

- tristeza persistente, anhedonia, desesperanza o culpa;
- ansiedad, preocupacion excesiva, panico o evitacion;
- cambios de sueno, apetito, energia y concentracion;
- deterioro laboral, academico, social o familiar;
- duracion y severidad de sintomas;
- necesidad de apoyo profesional cuando el funcionamiento esta comprometido.

Uso esperado:

- diferenciar malestar leve/moderado de deterioro importante;
- orientar preguntas de seguimiento;
- evitar diagnosticos cerrados y hablar en terminos de senales.

### Contexto psicosocial y factores asociados

Fuente local:

- `apps/backend/knowledge/evaluation/substance-use-and-context-assessment.md`

El agente puede procesar:

- desempleo, migracion, problemas economicos o familiares;
- ruptura, duelo, responsabilidades de cuidado o aislamiento;
- barreras para recibir ayuda;
- salud fisica, dolor, medicacion o cambios hormonales;
- consumo de alcohol u otras sustancias como factor contextual;
- violencia, abuso, inseguridad o coercion.

Uso esperado:

- entender factores que mantienen o agravan el malestar;
- detectar necesidades practicas, sociales o medicas;
- escalar si hay abuso, peligro, intoxicacion o incapacidad de autocuidado.

## Escenarios ampliados

### Uso problematico de sustancias

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/substance-use-disorders-assessment.md`

El agente puede procesar:

- alcohol, cannabis, estimulantes, opioides, sedantes, inhalantes u otras
  sustancias;
- frecuencia, cantidad aproximada y cambios recientes;
- perdida de control o intentos fallidos de reducir;
- consumo para dormir, calmar ansiedad, rendir, evitar recuerdos o manejar dolor;
- abstinencia, intoxicacion, lagunas mentales o sobredosis previa;
- mezcla de sustancias, especialmente alcohol, opioides y sedantes;
- consecuencias en seguridad, relaciones, estudio, trabajo o salud.

Senales de escalamiento:

- intoxicacion actual peligrosa;
- abstinencia severa;
- riesgo de sobredosis;
- consumo asociado a ideacion suicida, violencia o conduccion;
- embarazo con consumo;
- incapacidad de autocuidado.

### Duelo, perdida y separacion

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/grief-and-loss-assessment.md`

El agente puede procesar:

- muerte de un ser querido, mascota, ruptura, perdida de rol, proyecto o etapa;
- tristeza, enojo, culpa, shock, alivio o entumecimiento;
- recuerdos intrusivos, evitacion o imposibilidad de despedida;
- impacto en sueno, apetito, energia y funcionamiento;
- deseo de reunirse con una persona fallecida;
- duelo asociado a muerte violenta, suicidio o trauma.

Senales de escalamiento:

- ideacion suicida;
- culpa extrema o desesperanza persistente;
- aislamiento extremo;
- consumo para anestesiar el dolor;
- deterioro funcional severo.

### Trauma, estres postraumatico y disociacion

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/trauma-ptsd-dissociation-assessment.md`

El agente puede procesar:

- accidente, violencia, abuso, amenaza, negligencia, desastre, guerra o acoso;
- recuerdos intrusivos, pesadillas, flashbacks o sobresaltos;
- evitacion, hipervigilancia, irritabilidad, culpa o verguenza;
- disociacion, perdida de tiempo o sensacion de estar fuera del cuerpo;
- peligro actual o contacto con agresor;
- impacto en relaciones, intimidad, trabajo, estudio y autocuidado.

Senales de escalamiento:

- violencia o abuso actual;
- riesgo de autolesion o agresion;
- disociacion con perdida de control;
- menores o personas dependientes en riesgo;
- sintomas psicoticos o confusion intensa.

### Sueno, insomnio y fatiga

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/sleep-insomnia-fatigue-assessment.md`

El agente puede procesar:

- dificultad para conciliar, mantener el sueno o despertar temprano;
- hipersomnia, fatiga y somnolencia diurna;
- pesadillas, panico nocturno o recuerdos traumaticos;
- cafeina, alcohol, cannabis, estimulantes, sedantes o pantallas;
- turnos laborales, dolor, ronquidos o apnea sospechada;
- poca necesidad de dormir con energia alta o conducta riesgosa.

Senales de escalamiento:

- varios dias casi sin dormir con energia excesiva e impulsividad;
- confusion, alucinaciones o deterioro severo;
- somnolencia peligrosa;
- uso riesgoso de sedantes, alcohol u opioides;
- ideacion suicida nocturna.

### Alimentacion, peso e imagen corporal

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/eating-body-image-assessment.md`

El agente puede procesar:

- restriccion, ayunos o reglas rigidas de comida;
- miedo intenso a subir de peso;
- atracones o perdida de control;
- vomitos provocados, laxantes, diureticos o ejercicio compulsivo;
- verguenza, bullying, presion deportiva o familiar;
- mareos, desmayos, debilidad o irregularidades fisicas;
- coexistencia con ansiedad, depresion, trauma o autolesion.

Senales de escalamiento:

- desmayos, dolor toracico, confusion o debilidad marcada;
- purgas frecuentes;
- restriccion severa o perdida rapida de peso;
- embarazo con restriccion o purgas;
- menores con deterioro alimentario;
- ideacion suicida o autolesion.

### Mania, hipomania y psicosis

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/bipolar-mania-psychosis-assessment.md`

El agente puede procesar:

- energia elevada, poca necesidad de dormir o pensamiento acelerado;
- verborrea, grandiosidad, sensacion de invencibilidad o mision especial;
- gasto excesivo, sexo riesgoso, conduccion peligrosa o impulsividad;
- voces, visiones, paranoia o sensacion de persecucion;
- confusion, desorganizacion o dificultad para seguir conversaciones;
- consumo de sustancias, estimulantes o falta de sueno como detonantes.

Senales de escalamiento:

- casi no dormir con energia alta e impulsividad;
- voces que ordenan hacerse dano o danar a otros;
- paranoia con riesgo;
- conducta peligrosa o desorganizada;
- incapacidad de autocuidado;
- sintomas nuevos despues de consumo, fiebre, golpe o convulsion.

### Violencia, abuso y seguridad

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/domestic-violence-abuse-safety-assessment.md`

El agente puede procesar:

- violencia domestica, abuso, coercion, acoso o explotacion;
- control de telefono, dinero, movilidad, documentos o redes;
- amenazas, golpes, coercion sexual, humillacion, aislamiento o vigilancia;
- armas, estrangulamiento, amenazas de muerte o escalamiento;
- menores, adultos mayores, dependientes o mascotas en riesgo;
- privacidad y seguridad de la conversacion.

Senales de escalamiento:

- peligro inmediato;
- estrangulamiento, armas o amenazas de muerte;
- coercion sexual o abuso de menores;
- trata, secuestro, retencion de documentos o vigilancia extrema;
- lesion fisica actual;
- riesgo suicida vinculado al abuso.

### Salud mental perinatal y posparto

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/perinatal-postpartum-mental-health-assessment.md`

El agente puede procesar:

- embarazo, posparto, perdida gestacional, infertilidad o lactancia;
- depresion perinatal, ansiedad, culpa, agotamiento o irritabilidad;
- pensamientos intrusivos sobre dano al bebe;
- vinculo con el bebe y carga de cuidado;
- apoyo de pareja, familia o red;
- violencia, control reproductivo o consumo;
- antecedentes de bipolaridad, psicosis posparto o intentos suicidas.

Senales de escalamiento:

- pensamientos de hacerse dano o danar al bebe;
- alucinaciones, delirios, confusion o desorganizacion posparto;
- incapacidad de cuidar al bebe o a si misma;
- violencia domestica;
- sintomas fisicos preocupantes durante embarazo o posparto.

### Ninos, adolescentes y jovenes

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/child-adolescent-risk-assessment.md`

El agente puede procesar:

- edad y presencia de adulto seguro;
- cambios en escuela, amistades, sueno, apetito, irritabilidad o aislamiento;
- bullying, abuso, violencia, acoso digital o coercion sexual;
- autolesion, ideacion suicida, retos peligrosos o acceso a medios letales;
- consumo de sustancias;
- ansiedad, depresion, trauma, TDAH, desarrollo o aprendizaje;
- conflicto familiar, rechazo por identidad, migracion o duelo.

Senales de escalamiento:

- menor en peligro actual;
- ideacion suicida, autolesion o abuso;
- cuidador como fuente de peligro;
- psicosis, mania, consumo riesgoso o fuga de casa;
- restriccion alimentaria severa o purgas;
- falta de supervision adulta ante riesgo.

### Enfermedad cronica, dolor y discapacidad

Fuente local:

- `apps/backend/knowledge/evaluation-expanded/chronic-illness-pain-disability-assessment.md`

El agente puede procesar:

- enfermedad cronica, dolor persistente o discapacidad;
- impacto en movilidad, independencia, trabajo, estudio y relaciones;
- sueno, fatiga, apetito, concentracion y energia;
- duelo por cambios de vida, miedo al futuro o desesperanza;
- barreras economicas, medicas o de accesibilidad;
- medicacion, efectos secundarios o consumo para manejar dolor;
- pensamientos de no querer vivir con dolor o dependencia.

Senales de escalamiento:

- ideacion suicida relacionada con dolor, discapacidad o enfermedad terminal;
- deterioro medico no atendido;
- uso peligroso de opioides, sedantes, alcohol u otras sustancias;
- negligencia o abuso por cuidadores;
- incapacidad de autocuidado basico.

## Fuentes publicas de apoyo

Fuente local:

- `apps/backend/knowledge/public-sources/public-mental-health-rag-seed.md`

El agente puede usar contexto de fuentes publicas para:

- psicoeducacion general;
- conceptos de triage en salud mental;
- referencias de seguridad;
- orientacion sobre ayuda profesional;
- lenguaje no diagnostico y centrado en apoyo.

Fuentes base:

- WHO mhGAP Intervention Guide: https://www.who.int/publications/i/item/9789241549790
- WHO mhGAP guideline: https://www.who.int/publications/i/item/9789240084278
- WHO AUDIT: https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a
- NICE guidelines: https://www.nice.org.uk/guidance
- NIMH Mental Health Topics: https://www.nimh.nih.gov/health/topics
- SAMHSA Evidence-Based Practices Resource Center: https://www.samhsa.gov/libraries/evidence-based-practices-resource-center

## Reglas de uso del RAG

El agente debe:

- recuperar contexto antes de responder cuando el usuario describa sintomas,
  riesgo, consumo, trauma, duelo, violencia o deterioro funcional;
- usar el contenido como orientacion, no como diagnostico;
- preguntar de forma gradual y no acusatoria;
- priorizar seguridad cuando aparezcan senales de crisis;
- usar lenguaje claro, cuidadoso y culturalmente sensible;
- recomendar ayuda humana cuando el riesgo exceda apoyo automatizado.

El agente no debe:

- diagnosticar de forma definitiva;
- prescribir o ajustar medicacion;
- recomendar suspender medicamentos;
- dar instrucciones de desintoxicacion sin supervision;
- pedir detalles graficos de trauma o abuso;
- minimizar ideacion suicida, violencia, psicosis, abstinencia o sintomas
  fisicos graves;
- usar contenido propietario sin licencia como fuente de ingestion.

## Estado de ingestion

El corpus cargado en Supabase incluye:

- evaluacion inicial: 4 documentos, 11 fragmentos;
- escenarios ampliados: 10 documentos, 28 fragmentos;
- fuentes publicas iniciales: 1 documento, 6 fragmentos.

Total cargado al momento de este inventario:

- 15 documentos;
- 45 fragmentos vectorizados.
