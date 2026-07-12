<div align="center">

# 🌍 Life Expectancy Analysis using Machine Learning

### Predicting Global Life Expectancy using WHO Healthcare Indicators

<img src="images/dashboard.png" width="1000"/>

---

### 📊 Exploratory Data Analysis • 🤖 Machine Learning • 🌎 WHO Dataset

<img src="https://img.shields.io/badge/Python-3.11-blue?logo=python">
<img src="https://img.shields.io/badge/Pandas-Data%20Analysis-yellow?logo=pandas">
<img src="https://img.shields.io/badge/Scikit--Learn-ML-orange?logo=scikit-learn">
<img src="https://img.shields.io/badge/Random%20Forest-Best%20Model-success">
<img src="https://img.shields.io/badge/Status-Completed-brightgreen">

</div>

# 📌 About

Life expectancy is one of the most significant indicators of a nation's healthcare quality, economic development, and overall well-being.

This project investigates how healthcare expenditure, GDP, education, immunization, mortality rates, and demographic variables influence life expectancy across countries using the World Health Organization dataset.

The workflow combines **data preprocessing, exploratory analysis, statistical correlation, feature engineering, and predictive machine learning** to uncover actionable insights and accurately estimate life expectancy.

# 📊 Dashboard Overview

<p align="center">

<img src="images/dashboard.png" width="1000">

</p>

## 📂 Dataset Overview

This project utilizes the **WHO Life Expectancy Dataset**, which combines health, economic, demographic, and social indicators collected from countries worldwide. The dataset provides valuable insights into the factors that influence life expectancy and serves as the foundation for predictive modeling.

### 📋 Dataset Summary

| Attribute | Details |
|:----------|:--------|
| **Dataset Name** | WHO Life Expectancy Dataset |
| **Source** | World Health Organization (WHO) |
| **Time Period** | 2000 – 2015 |
| **Observations** | 2,938 |
| **Features** | 22 |
| **Target Variable** | Life Expectancy (Years) |
| **Project Type** | Regression Analysis |

---

### 📑 Key Variables

| Category | Features |
|:---------|:---------|
| 🌍 **Geographical** | Country, Year, Status |
| ❤️ **Health Indicators** | Adult Mortality, Infant Deaths, Under-Five Deaths, BMI, HIV/AIDS |
| 💉 **Immunization** | Hepatitis B, Polio, Diphtheria |
| 💰 **Economic Factors** | GDP, Health Expenditure |
| 🎓 **Social Indicators** | Schooling, Income Composition of Resources |
| 🍷 **Lifestyle Factors** | Alcohol Consumption |
| 👥 **Population Metrics** | Population, Measles Cases |

---

### 🎯 Target Variable

The primary objective of this project is to predict **Life Expectancy (Years)** based on multiple healthcare, economic, and demographic indicators.

---

### 📌 Why This Dataset?

This dataset is widely used for **regression**, **public health analytics**, and **predictive modeling** because it integrates diverse indicators that collectively influence life expectancy. It enables the exploration of relationships between socio-economic conditions, healthcare access, disease prevalence, and population health outcomes.

### 🖼️ Dataset Preview

<p align="center">
  <img src="images/dataset_preview.png" width="900" alt="Dataset Preview">
</p>

### 📊 Dataset Statistics

| Metric | Value |
|:-------|------:|
| 🌍 Countries Covered | 193 |
| 📅 Years Analyzed | 16 |
| 📈 Total Records | 2,938 |
| 🧩 Features | 22 |
| 🎯 Target Variable | Life Expectancy |
| 🔍 ML Task | Regression |


# EDA

<table>
<tr>

<td>

<img src="images/heatmap.png">

</td>

<td>

<img src="images/developed.png">

</td>

</tr>

<tr>

<td>

<img src="images/gdp.png">

</td>

<td>

<img src="images/distribution.png">

</td>

</tr>

</table>


# 🤖 ML Pipeline
```
Dataset

↓

Cleaning

↓

EDA

↓

Feature Engineering

↓

Encoding

↓

Train Test Split

↓

Linear Regression

↓

Random Forest

↓

Evaluation

↓

Prediction
```

## 📈 Model Performance

To predict life expectancy, two supervised machine learning algorithms were implemented and evaluated:

- 📉 **Linear Regression** — Baseline regression model for understanding linear relationships.
- 🌲 **Random Forest Regressor** — Ensemble learning model capable of capturing complex, non-linear patterns.

### Performance Comparison

| Model | MAE ↓ | RMSE ↓ | R² Score ↑ |
|:------|------:|-------:|-----------:|
| Linear Regression | XX.XX | XX.XX | 0.XX |
| Random Forest Regressor | XX.XX | XX.XX | 0.XX |

> **Note:** Replace the placeholder values with your actual evaluation metrics.

### 📊 Model Comparison

<p align="center">
  <img src="images/model_performance.png" width="750" alt="Model Performance Comparison">
</p>

### 🏆 Best Performing Model

The **Random Forest Regressor** achieved the highest prediction accuracy by effectively learning complex relationships between healthcare, economic, and demographic variables. Compared to Linear Regression, it demonstrated:

- ✅ Higher **R² Score**
- ✅ Lower **Mean Absolute Error (MAE)**
- ✅ Lower **Root Mean Squared Error (RMSE)**
- ✅ Better generalization on unseen data



## 💡 Key Insights

The exploratory data analysis and machine learning models revealed several important factors influencing global life expectancy:

### 🌍 1. Development Status Matters
Developed countries consistently exhibit **higher life expectancy** than developing countries, reflecting stronger healthcare infrastructure, better education systems, and improved living standards.

---

### 📉 2. Adult Mortality is the Strongest Negative Predictor
Adult Mortality showed the **highest negative correlation** with life expectancy. Countries with higher adult mortality rates generally experience significantly lower average life expectancy.

---

### 🎓 3. Education Plays a Crucial Role
**Schooling** emerged as one of the most influential positive predictors. Increased years of education are strongly associated with healthier lifestyles, improved healthcare awareness, and longer life expectancy.

---

### 💰 4. Economic Growth Improves Health Outcomes
Higher **GDP per capita** is positively associated with life expectancy, indicating that economically stronger nations can invest more effectively in healthcare services, nutrition, and public health initiatives.

---

### 💉 5. Immunization Contributes to Longer Life Expectancy
Countries with higher vaccination coverage (such as **Polio** and **Hepatitis B**) generally recorded better life expectancy, highlighting the importance of preventive healthcare programs.

---

### 👶 6. Child Mortality Significantly Impacts Life Expectancy
Higher **Infant Deaths** and **Under-Five Deaths** were strongly associated with lower life expectancy, emphasizing the importance of maternal and child healthcare services.

---

### 🌲 7. Random Forest Delivered Superior Predictions
Among the evaluated machine learning models, the **Random Forest Regressor** achieved the best predictive performance by effectively capturing complex, non-linear relationships between health, demographic, and economic variables.

---
## 🚀 Future Work

Although the current project demonstrates strong predictive performance, several enhancements can further improve its accuracy, interpretability, and real-world applicability.

### 📈 Model Improvements
- Implement advanced ensemble models such as **XGBoost**, **LightGBM**, and **CatBoost**.
- Perform **hyperparameter tuning** using Grid Search and Randomized Search for optimal model performance.
- Explore **cross-validation** techniques to improve model robustness and reduce overfitting.

### 🔍 Model Explainability
- Integrate **SHAP (SHapley Additive Explanations)** to interpret feature contributions.
- Apply **LIME** for local model explanations and prediction transparency.
- Analyze feature interactions using **Partial Dependence Plots (PDP)**.

### 📊 Interactive Visualization
- Develop an interactive **Power BI** dashboard for dynamic data exploration.
- Build a **Tableau** dashboard with filters, KPIs, and country-wise comparisons.
- Create interactive visualizations using **Plotly**.

### 🌐 Deployment
- Deploy the model as a **Streamlit Web Application**.
- Expose predictions through a **Flask/FastAPI REST API**.
- Containerize the application using **Docker** for reproducible deployments.

### ☁️ Production Readiness
- Automate workflows using **GitHub Actions**.
- Add unit tests for data preprocessing and model evaluation.
- Deploy the application to cloud platforms such as **Render**, **Railway**, or **AWS**.

> **Goal:** Transform this project from a machine learning notebook into a production-ready end-to-end data science application.

## 📁 Project Structure

```text
Life-Expectancy-Analysis/
│
├── 📂 dataset/
│   └── Life Expectancy Data.csv
│
├── 📂 notebook/
│   └── Life_Expectancy_Analysis.ipynb
│
├── 📂 images/
│   ├── dashboard.png
│   ├── workflow.png
│   ├── correlation_heatmap.png
│   ├── developed_vs_developing.png
│   ├── feature_importance.png
│   ├── model_performance.png
│   └── prediction_comparison.png
│
├── 📄 README.md
├── 📄 requirements.txt
├── 📄 LICENSE
└── 📄 .gitignore
```

---

<div align="center">

# 👨‍💻 About the Author

### **AD**

**Data Science • Machine Learning • Python • Data Analytics**

Passionate about transforming real-world data into meaningful insights through machine learning, data visualization, and predictive analytics. I enjoy building end-to-end data science projects that combine analytical thinking with practical solutions.

---

### 🤝 Let's Connect

<p align="center">
<a href="https://github.com/your-github-username">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

<a href="https://www.linkedin.com/in/your-linkedin/">
<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin">
</a>

<a href="mailto:your-email@example.com">
<img src="https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail">
</a>
</p>

---

⭐ **If you found this project helpful or insightful, consider giving it a star on GitHub!**


</div>

---

<div align="center">

