export interface ScreeningOption {
  value: number;
  label: string;
}

export interface ScreeningQuestion {
  id: string;
  text: string;
}

// Frecuencia en las últimas 2 semanas (formato estándar PHQ-9 / GAD-7)
export const SCREENING_OPTIONS: ScreeningOption[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

// PHQ-9 — el ítem 9 evalúa ideación suicida (compuerta de crisis).
export const PHQ9_QUESTIONS: ScreeningQuestion[] = [
  { id: 'phq1', text: 'Poco interés o placer en hacer cosas' },
  { id: 'phq2', text: 'Se ha sentido decaído/a, deprimido/a o sin esperanza' },
  { id: 'phq3', text: 'Problemas para dormir o dormir demasiado' },
  { id: 'phq4', text: 'Se ha sentido cansado/a o con poca energía' },
  { id: 'phq5', text: 'Poco apetito o comer en exceso' },
  { id: 'phq6', text: 'Se ha sentido mal con usted mismo/a, o que ha decepcionado a su familia' },
  { id: 'phq7', text: 'Dificultad para concentrarse (leer, ver televisión)' },
  { id: 'phq8', text: 'Se ha movido o hablado muy lento, o al contrario, muy inquieto/a' },
  { id: 'phq9', text: 'Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera' },
];

// GAD-7
export const GAD7_QUESTIONS: ScreeningQuestion[] = [
  { id: 'gad1', text: 'Sentirse nervioso/a, ansioso/a o con los nervios de punta' },
  { id: 'gad2', text: 'No poder dejar de preocuparse o no poder controlar la preocupación' },
  { id: 'gad3', text: 'Preocuparse demasiado por diferentes cosas' },
  { id: 'gad4', text: 'Dificultad para relajarse' },
  { id: 'gad5', text: 'Estar tan inquieto/a que es difícil quedarse quieto/a' },
  { id: 'gad6', text: 'Molestarse o irritarse fácilmente' },
  { id: 'gad7', text: 'Sentir miedo como si algo terrible fuera a pasar' },
];
