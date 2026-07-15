export type SectionStatus = 'empty' | 'in_progress' | 'completed';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

export interface CanvasSection {
  id: string;
  title: string;
  description: string;
  content: string;
  icon?: string;
  category: 'strategy' | 'operations';
  gridSpan?: { cols?: number; rows?: number };
  status: SectionStatus;
}

export interface GovernanceCanvas {
  id: string;
  name: string;
  accessCode: string;
  templateId?: string;
  sections: CanvasSection[];
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Omit<CanvasSection, 'content' | 'status'>[];
  defaultContent: Record<string, string>;
}

export interface QuestionnaireAnswer {
  questionId: string;
  answerId: string;
}

// Section metadata for Focus Mode
export interface SectionMetadata {
  id: string;
  explanation: string;
  guidingQuestions: string[];
}

export const SECTION_METADATA: Record<string, SectionMetadata> = {
  'lab-objectives': {
    id: 'lab-objectives',
    explanation: 'Define the overarching goals and purposes that guide your Living Lab or PCED initiative. Rewrite the Lab objectives and keep those as a North Star to define the strategy and operations for your lab.',
    guidingQuestions: [
      'What are the main objectives you want to achieve with your governance model?',
      'How do these objectives align with community or stakeholder needs?',
      'What outcomes would indicate success for your initiative?',
    ],
  },
  'decision-making': {
    id: 'decision-making',
    explanation: 'A structured decision-making process ensures the effective implementation of the strategic objectives of the Living Lab. Depending on the local context, the decision-making can take several forms.',
    guidingQuestions: [
      'Who can make decisions? (Top-down, Bottom-up, or Horizontal)',
      'What is the decision-making process? (Centralised or Decentralised)',
      'How are conflicts or disagreements resolved?',
    ],
  },
  'leadership': {
    id: 'leadership',
    explanation: 'The leadership defines the strategy closely following the mission and vision of the lab. This level can be comprised of different stakeholders and different management forms.',
    guidingQuestions: [
      'Who is the lead? (Public board, Public-private board, Steering committee, Project committees)',
      'Who is initiating the lab activities?',
      'How is leadership organised and what are the main responsibilities?',
    ],
  },
  'citizen-involvement': {
    id: 'citizen-involvement',
    explanation: 'Following the quadruple helix principle, Living Labs work best when all four stakeholder groups are equally integrated. Developing strategies for citizen involvement is beneficial to the mission and longevity of the lab.',
    guidingQuestions: [
      'How are citizens involved in lab activities? (Citizens\' initiative, Citizen-centred, Consultation only, No involvement)',
      'How do you ensure diverse voices are heard and represented?',
      'What mechanisms support ongoing citizen engagement?',
    ],
  },
  'finances': {
    id: 'finances',
    explanation: 'The management of finances includes a long-term strategy on how existing money is managed, how financial decisions are being made and how the financing is secured in the long term.',
    guidingQuestions: [
      'From where are funds for the lab coming? (Public, Private, Public-private)',
      'Who is managing the lab money?',
      'What are future funding opportunities and long-term financing strategies?',
    ],
  },
  'legal-status': {
    id: 'legal-status',
    explanation: 'Living Labs do not require a legal status under which they operate, especially in their initiation phase. However, as the labs grow and become formalised, a legal status can help to make decisions, comply with regulations and work on the growth of the lab.',
    guidingQuestions: [
      'Do we need a legal status?',
      'What kind of legal entity suits our work the best? (No legal status, Joint-venture, Co-operative)',
      'How does our legal status affect governance and funding opportunities?',
    ],
  },
  'operations-management': {
    id: 'operations-management',
    explanation: 'The operations management defines the day-to-day functioning and execution of the strategy. It covers who manages the operations and which tasks have to be performed to keep the lab running.',
    guidingQuestions: [
      'Who is managing the operations? (Single operations manager, Manager per working group)',
      'Which tasks have to be performed to keep the lab running?',
      'How are operational decisions made and communicated?',
    ],
  },
  'working-groups': {
    id: 'working-groups',
    explanation: 'Working groups or task forces are essential in the operations of the PCEDs and are the heart of the Living Labs. The groups organise and execute the lab activities.',
    guidingQuestions: [
      'How are working groups organised? (Thematic, Geographic, or Project-based)',
      'How are working group members selected and their roles defined?',
      'How do working groups report and coordinate with each other?',
    ],
  },
  'stakeholders': {
    id: 'stakeholders',
    explanation: 'Identify the main actors from the four stakeholder groups (public authorities, research organisations, private companies, and citizens) and define their roles, activities and responsibilities.',
    guidingQuestions: [
      'How are the four stakeholder groups involved in the PCED?',
      'What are their contributions? (Financial, Expertise, Time, Resources)',
      'What are their roles, activities and responsibilities?',
    ],
  },
  'internal-communication': {
    id: 'internal-communication',
    explanation: 'Internal communication focuses on how lab members are communicating with each other. Having a defined way of communication and standards can improve communication and make it a priority within the lab.',
    guidingQuestions: [
      'How are we communicating? (Online meetings, In-person, Workshops, Working seminars)',
      'How often should we meet?',
      'How do we communicate progress and issues?',
    ],
  },
};

export const DEFAULT_CANVAS_SECTIONS: Omit<CanvasSection, 'content' | 'status'>[] = [
  // Strategy sections
  {
    id: 'lab-objectives',
    title: 'LAB Objectives',
    description: 'Define the main goals and purposes of your Living Lab or PCED',
    category: 'strategy',
    gridSpan: { cols: 2, rows: 1 },
  },
  {
    id: 'decision-making',
    title: 'Decision-making',
    description: 'Define the decision-making approach and process',
    category: 'strategy',
  },
  {
    id: 'leadership',
    title: 'Leadership',
    description: 'Define who leads and how leadership is organised',
    category: 'strategy',
  },
  {
    id: 'citizen-involvement',
    title: 'Citizen Involvement',
    description: 'Outline how citizens participate in the lab',
    category: 'strategy',
    gridSpan: { cols: 2, rows: 1 },
  },
  {
    id: 'finances',
    title: 'Finances',
    description: 'Identify funding sources, management and long-term strategy',
    category: 'strategy',
  },
  {
    id: 'legal-status',
    title: 'Legal Status',
    description: 'Define the legal framework and entity type',
    category: 'strategy',
  },
  // Operations sections
  {
    id: 'operations-management',
    title: 'Operations Management',
    description: 'Day-to-day operational procedures and management',
    category: 'operations',
    gridSpan: { cols: 2, rows: 1 },
  },
  {
    id: 'working-groups',
    title: 'Working Groups',
    description: 'Define working groups and how they are organised',
    category: 'operations',
    gridSpan: { rows: 2 },
  },
  {
    id: 'stakeholders',
    title: 'Stakeholders',
    description: 'Identify the four stakeholder groups and their roles',
    category: 'operations',
    gridSpan: { rows: 2 },
  },
  {
    id: 'internal-communication',
    title: 'Internal Communication',
    description: 'Define communication channels, frequency and standards',
    category: 'operations',
    gridSpan: { cols: 2, rows: 1 },
  },
];

export const GOVERNANCE_TEMPLATES: GovernanceTemplate[] = [
  {
    id: 'public-board',
    name: 'Full Public Board',
    description: 'Led by public entities. The board makes decisions for the lab without involving other stakeholders.',
    icon: 'building-2',
    sections: DEFAULT_CANVAS_SECTIONS,
    defaultContent: {
      'lab-objectives': 'Sets regulatory frameworks for PCED\nCreates incentive programs for private companies\nDevelops engagement strategies for research and citizen involvement',
      'decision-making': 'Top-down\nCentralised',
      'leadership': 'Public Board',
      'citizen-involvement': 'Citizen consultation only\nNo citizens involvement',
      'finances': 'Public funds\nBoard manages finances\nIncentivising public funders',
      'legal-status': 'No legal status',
      'operations-management': 'Operations managers for each working group',
      'working-groups': 'Thematic groups\nGeographic groups\nProject groups',
      'stakeholders': 'Private sector: contributes through funding and expertise\nAcademia contributes technical expertise\nCitizens participate in events or consult',
      'internal-communication': 'Online meetings\nWorkshop\nIn-person meetings\nWorking seminars',
    },
  },
  {
    id: 'hybrid',
    name: 'Public-Private Partnership',
    description: 'Led by public entities and private companies. The board makes decisions for the lab without involving other stakeholders.',
    icon: 'handshake',
    sections: DEFAULT_CANVAS_SECTIONS,
    defaultContent: {
      'lab-objectives': 'Collaboration between public and private sector to make PCEDs economically viable',
      'decision-making': 'Top-down\nCentralised',
      'leadership': 'Public-Private Board',
      'citizen-involvement': 'Citizen consultation only\nNo citizens involvement',
      'finances': 'Public and private funding\nBoard manages finances\nDevelopment of market solutions',
      'legal-status': 'No legal status\nJoint-venture',
      'operations-management': 'Appointed operations manager\nOperations manager for each working group',
      'working-groups': 'Thematic groups\nGeographic groups\nProject groups',
      'stakeholders': 'Private sector: contributes through funding and expertise\nAcademia contributes technical expertise\nCitizens participate in events or consult',
      'internal-communication': 'Online meetings\nIn-person meetings\nWorkshops\nWorking seminars',
    },
  },
  {
    id: 'community-based',
    name: 'Community-Based Governance',
    description: 'Fostering local ownership, engagement, and empowerment to achieve support and acceptance of PCED initiatives.',
    icon: 'users',
    sections: DEFAULT_CANVAS_SECTIONS,
    defaultContent: {
      'lab-objectives': 'Fostering local ownership, engagement, and empowerment to achieve support and acceptance of PCED initiatives',
      'decision-making': 'Bottom-up\nDecentralised',
      'leadership': 'Steering committee of citizens and local SMEs',
      'citizen-involvement': 'Active citizen involvement\nMain decision makers',
      'finances': 'Public and private funding\nShared management\nWinning public funding',
      'legal-status': 'No legal status\nCo-operative\nRegistered non-profit',
      'operations-management': 'Operations manager for the whole lab\nDevelopment and implementation of operations by working groups\nOperations managers for each working group',
      'working-groups': 'Thematic groups\nGeographic groups\nProject groups',
      'stakeholders': 'Municipalities provide funding and co-organise local activities\nAcademia advises on technology and organisation',
      'internal-communication': 'Online meetings\nIn-person meetings\nWorkshops\nWorking sessions',
    },
  },
  {
    id: 'multi-stakeholder',
    name: 'Multi-Stakeholder Partnership',
    description: 'Promoting collaboration, innovation, and collective action to address complex energy challenges. All four stakeholder groups are actively involved.',
    icon: 'network',
    sections: DEFAULT_CANVAS_SECTIONS,
    defaultContent: {
      'lab-objectives': 'Promoting collaboration, innovation, and collective action to address complex energy challenges\nAll four stakeholder groups are actively involved',
      'decision-making': 'Bottom-up\nSteering committee of four stakeholder groups',
      'leadership': 'Steering committee of four stakeholder groups',
      'citizen-involvement': 'Citizens are part of steering committees\nActive citizen involvement',
      'finances': 'Public project funding\nShared management\nIncentivising private investors\nWinning public funding',
      'legal-status': 'No legal status\nCo-operative\nConsortium',
      'operations-management': 'Operations manager for the whole lab\nDevelopment and implementation of operations by working group\nOperations managers for each working group',
      'working-groups': 'Thematic groups\nGeographic groups\nProject groups',
      'stakeholders': 'Academia contributes through expertise\nPrivate sector contributes through funding and expertise\nMunicipalities contribute through funding, expertise, and legal frameworks\nCitizens contribute time, expertise, and other resources',
      'internal-communication': 'Online meetings\nWorkshops\nIn-person meetings\nWorking seminars',
    },
  },
  {
    id: 'project-based',
    name: 'Project-Based Governance',
    description: 'Build long-term trust and relationships between stakeholders in the form of local projects with set goals for the PCEDs.',
    icon: 'clipboard-list',
    sections: DEFAULT_CANVAS_SECTIONS,
    defaultContent: {
      'lab-objectives': 'Build long-term trust and relationships between the stakeholders in the form of local projects with set goals for the PCEDs',
      'decision-making': 'Bottom-up\nDecentralised',
      'leadership': 'Project committees – each committee leads a specific project in the PCED',
      'citizen-involvement': 'Citizens\' initiative\nCitizen-centred',
      'finances': 'Public and private funds\nShared management\nWinning public funding',
      'legal-status': 'No legal status\nRegistered non-profit\nCo-operative',
      'operations-management': 'Development and implementation of operations by working groups\nOperations managers for each working group',
      'working-groups': 'Project working groups – groups are organised based on local mini projects',
      'stakeholders': 'All four stakeholder groups contribute through expertise, funding, time, and resources',
      'internal-communication': 'Online meetings\nIn-person meetings\nWorkshops\nWorking sessions',
    },
  },
];

export const QUESTIONNAIRE_QUESTIONS = [
  {
    id: 'leadership-type',
    question: 'Who should primarily lead your governance model?',
    options: [
      { id: 'public', label: 'Public authorities (municipality, government)' },
      { id: 'community', label: 'Community members and local citizens' },
      { id: 'mixed', label: 'A combination of public and private entities' },
      { id: 'multi', label: 'All four stakeholder groups equally' },
    ],
  },
  {
    id: 'decision-approach',
    question: 'How should major decisions be made?',
    options: [
      { id: 'hierarchical', label: 'Top-down through formal hierarchical structures' },
      { id: 'consensus', label: 'Bottom-up through community consensus' },
      { id: 'collaborative', label: 'Through collaborative steering committees' },
      { id: 'project', label: 'Decentralised through project committees' },
    ],
  },
  {
    id: 'citizen-role',
    question: 'What level of citizen involvement do you envision?',
    options: [
      { id: 'consultative', label: 'Citizen consultation only' },
      { id: 'participatory', label: 'Citizen-centred: needs are being prioritised' },
      { id: 'co-creation', label: 'Active citizen involvement and citizens\' initiative' },
      { id: 'none', label: 'No active citizens involvement' },
    ],
  },
  {
    id: 'funding-source',
    question: 'What is your primary funding approach?',
    options: [
      { id: 'public', label: 'Primarily public funding' },
      { id: 'community', label: 'Shared management of finances by lab stakeholders' },
      { id: 'mixed', label: 'Public-private funding mix' },
    ],
  },
];
