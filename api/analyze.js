// 後端 API 處理示例
module.exports = async (req, res) => {
    // 設置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 請求' });
    }

    try {
        const { action, constitution, element_balance, symptoms, user_info } = req.body;

        switch (action) {
            case 'detailed_tcm_analysis':
                const analysis = await getDetailedTCMAnalysis(constitution, element_balance, symptoms, user_info);
                return res.json({ success: true, data: analysis });
                
            case 'submit_symptoms':
                const symptomResult = await analyzeSymptoms(symptoms, user_info);
                return res.json({ success: true, data: symptomResult });
                
            case 'get_herb_details':
                const herbDetails = await getHerbDetails(req.body.herb_name);
                return res.json({ success: true, data: herbDetails });
                
            default:
                return res.status(400).json({ error: '未知的操作類型' });
        }
    } catch (error) {
        console.error('API 錯誤:', error);
        return res.status(500).json({ error: '伺服器內部錯誤' });
    }
};

// 詳細中醫分析函數
async function getDetailedTCMAnalysis(constitution, element_balance, symptoms, user_info) {
    // 這裡可以連接真正的中醫數據庫或 AI 分析服務
    // 示例返回數據結構：
    return {
        constitution: constitution + '型體質',
        zang_fu: {
            zang: getZangByElement(constitution),
            fu: getFuByElement(constitution)
        },
        patterns: getPatternsByConstitution(constitution, symptoms),
        risk_factors: getRiskFactors(constitution, element_balance),
        recommended_departments: getRecommendedDepartments(constitution, symptoms),
        herbal_prescriptions: getHerbalSuggestions(constitution, symptoms),
        acupuncture_points: getAcupuncturePoints(constitution),
        lifestyle_advice: getLifestyleAdvice(constitution, element_balance),
        diet_recommendations: getDietRecommendations(constitution),
        exercise_suggestions: getExerciseSuggestions(constitution),
        urgent_advice: getUrgentAdvice(symptoms)
    };
}
