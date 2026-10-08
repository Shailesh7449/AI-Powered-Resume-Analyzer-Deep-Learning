export interface SampleResume {
  id: string;
  title: string;
  role: string;
  text: string;
}

export interface SampleJobDescription {
  id: string;
  title: string;
  company: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: "ml-engineer",
    title: "AI & ML Graduate Engineer",
    role: "Machine Learning / Data Science",
    text: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | linkedin.com/in/alexchen-ai | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Results-driven Computer Science graduate with strong foundation in Machine Learning, Deep Learning, and predictive modeling. Experienced in developing scalable machine learning pipelines and transformer architectures using Python, PyTorch, and Scikit-Learn. Passionate about applying AI solutions to solve real-world problems.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | GPA: 3.82 / 4.0
Graduation: May 2025
Relevant Coursework: Deep Learning, Natural Language Processing, Data Structures, Algorithms, Distributed Systems.

TECHNICAL SKILLS
• Programming: Python, C++, SQL, JavaScript, TypeScript
• AI & Machine Learning: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, Deep Learning, Transformers, NLP
• Web & Cloud: FastAPI, Flask, Docker, Git, Linux, REST APIs

EXPERIENCE
Machine Learning Engineering Intern | NeuralTech Systems | June 2024 – August 2024
• Developed predictive models using Python and Scikit-Learn, improving classification accuracy by 14%.
• Built end-to-end data pipelines for preprocessing 2M+ tabular records using Pandas and NumPy.
• Containerized microservices using Docker and deployed FastAPI REST endpoints for real-time model inference.
• Collaborated in an agile sprint team to benchmark BERT and Sentence Transformer embedding models.

PROJECTS
• Intelligent Semantic Document Search: Implemented transformer embeddings with PyTorch and FAISS, enabling semantic document similarity retrieval across 50,000 research papers with 92% precision.
• Real-Time Object Detection Pipeline: Engineered a deep learning model using PyTorch achieving 45 FPS on edge devices.
• Automated Code Quality Analyzer: Built a full-stack tool using Python and React to detect algorithmic smells and code complexity.

ACHIEVEMENTS & CERTIFICATIONS
• Winner: Berkeley AI Hackathon 2024 (Best Natural Language Processing Solution)
• DeepLearning.AI Deep Learning Specialization Certificate (Coursera)
• Published author in Undergraduate CS Research Symposium 2024`,
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Web Developer",
    role: "Full Stack / Software Engineer",
    text: `PRIYA SHARMA
Austin, TX | priya.sharma@example.com | github.com/priyasharma-web

PROFESSIONAL SUMMARY
Proactive Software Engineer with hands-on experience building modern, responsive web applications using React, Node.js, and TypeScript. Solid background in RESTful API development, PostgreSQL database architecture, and Docker containerization.

EDUCATION
Bachelor of Technology in Computer Engineering
Austin Institute of Technology | CGPA: 8.9 / 10.0
Graduation: 2024

TECHNICAL SKILLS
• Frontend: React, Next.js, TypeScript, JavaScript, HTML/CSS, Tailwind CSS
• Backend: Node.js, Express.js, REST APIs, GraphQL, Python
• Databases & Tools: SQL, PostgreSQL, MongoDB, Docker, Git, Linux, CI/CD

EXPERIENCE
Software Developer Intern | CloudScale Solutions | Jan 2024 – May 2024
• Developed modular frontend components using React and TypeScript, reducing UI render latency by 28%.
• Designed and integrated 15+ secure REST APIs with Node.js and Express for user authentication and billing.
• Managed PostgreSQL database schemas, indexing queries to speed up search response times.
• Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker.

PROJECTS
• Collaborative Kanban Task Manager: Created real-time project management dashboard using React, Node.js, and WebSockets.
• E-Commerce Storefront Engine: Built complete shopping application with Stripe payments, TypeScript, and MongoDB.

CERTIFICATIONS
• Meta Certified Frontend Developer
• AWS Certified Cloud Practitioner`,
  },
  {
    id: "data-analyst",
    title: "Data Analyst / BI Specialist",
    role: "Data Analytics / BI",
    text: `MARCUS REID
Seattle, WA | marcus.reid@example.com | linkedin.com/in/marcus-reid

SUMMARY
Analytical Data Analyst with extensive experience in exploratory data analysis, statistical modeling, and automated dashboard reporting. Proficient in Python, SQL, Pandas, and interactive visualization tools.

EDUCATION
Bachelor of Science in Information Systems & Statistics
University of Washington | GPA: 3.75 / 4.0

TECHNICAL SKILLS
• Analysis & Modeling: Data Analysis, Pandas, NumPy, Scikit-Learn, Statistics, EDA
• Databases: SQL, PostgreSQL, MySQL
• Programming: Python, R
• Tools: Git, Tableau, Power BI, Excel

EXPERIENCE
Data Analyst Intern | Apex Retail Analytics | May 2024 – Aug 2024
• Extracted and transformed customer transaction datasets of 500k+ rows using SQL and Python.
• Built predictive regression models using Scikit-Learn to forecast monthly inventory demand.
• Designed automated executive dashboards in Tableau, saving 6 hours of weekly manual reporting.

PROJECTS
• Customer Churn Prediction Engine: Analyzed customer behavior patterns in Python using Pandas; identified top 5 churn indicators.
• Financial Market Sentiment Tracker: Scraped financial news headlines and performed exploratory analysis with Pandas.`,
  },
];

export const SAMPLE_JOB_DESCRIPTIONS: SampleJobDescription[] = [
  {
    id: "ml-job",
    title: "Machine Learning Engineer",
    company: "Apex AI Labs",
    text: `Job Title: Machine Learning Engineer
Company: Apex AI Labs
Location: San Francisco, CA (Hybrid)

About the Role:
We are seeking a talented Machine Learning Engineer to design, build, and deploy production-grade machine learning and deep learning solutions. In this role, you will work closely with our research and product engineering teams to train neural architectures, optimize semantic embeddings, and serve high-throughput APIs.

Key Responsibilities:
• Build machine learning solutions using Python, PyTorch, and Scikit-Learn.
• Develop and fine-tune Transformer and deep learning models for natural language understanding.
• Containerize machine learning pipelines using Docker and deploy scalable inference microservices.
• Work with SQL and distributed datasets to preprocess features and optimize training pipelines.
• Collaborate in an agile engineering environment using Git and CI/CD best practices.

Requirements:
• Bachelor's or Master's degree in Computer Science, Data Science, or related technical field.
• Strong programming proficiency in Python.
• Practical experience with PyTorch, TensorFlow, Scikit-Learn, and Pandas.
• Familiarity with Docker containerization and modern REST APIs (FastAPI or Flask).
• Solid understanding of Machine Learning fundamentals, deep learning, and vector embeddings.
• Bonus: Experience with AWS or Google Cloud deployments.`,
  },
  {
    id: "fullstack-job",
    title: "Full Stack Software Engineer",
    company: "NextWave Tech",
    text: `Job Title: Full Stack Software Engineer
Company: NextWave Tech
Location: Remote

Overview:
NextWave Tech is looking for a Full Stack Engineer to build responsive web applications. You will work across the entire stack, from modern React interfaces to resilient Node.js microservices.

Responsibilities:
• Architect clean, modular web applications using React, TypeScript, and Tailwind CSS.
• Design, implement, and maintain REST APIs using Node.js and Express.js.
• Optimize SQL database schemas and write efficient queries in PostgreSQL.
• Deploy services using Docker and manage cloud infrastructure on AWS.
• Participate in code reviews, testing, and continuous integration (CI/CD).

Qualifications:
• Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.
• Hands-on expertise with React, JavaScript, and TypeScript.
• Backend proficiency with Node.js and RESTful architecture.
• Strong knowledge of SQL databases and Docker containerization.
• Familiarity with Git version control and agile workflows.`,
  },
  {
    id: "data-job",
    title: "Data Analyst / Scientist",
    company: "DataVantage Insights",
    text: `Job Title: Junior Data Scientist / Data Analyst
Company: DataVantage Insights
Location: New York, NY

Responsibilities:
• Conduct exploratory data analysis on large structured and unstructured datasets.
• Develop statistical and machine learning models using Python, Pandas, and Scikit-Learn.
• Write complex SQL queries to extract data from PostgreSQL warehouses.
• Build automated dashboards and present actionable insights to stakeholders.

Requirements:
• Degree in Computer Science, Statistics, Mathematics, or Data Analytics.
• Strong Python programming skills (Pandas, NumPy, Scikit-Learn).
• Proficiency in SQL and relational database query optimization.
• Understanding of core machine learning algorithms and statistical validation.`,
  },
];
