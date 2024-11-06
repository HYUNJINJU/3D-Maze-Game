const RANKING_KEY = 'mazeRanking';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rankingButton')?.addEventListener('click', openRanking);
    document.querySelector('.close')?.addEventListener('click', closeRanking);
    
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadRanking(this.dataset.difficulty);
        });
    });

    window.onclick = function(event) {
        if (event.target === document.getElementById('rankingModal')) {
            closeRanking();
        }
    }
});

function getDifficultyTag(difficulty) {
    if (typeof difficulty === 'number') {
        switch(difficulty) {
            case 0: return "easy";
            case 1: return "medium";
            case 2: return "hard";
            default: return `custom-${difficulty}`; // 커스텀 사이즈 저장
        }
    }
    return difficulty;
}

function addRecord(difficulty, time) {
    let rankings = JSON.parse(localStorage.getItem(RANKING_KEY) || '[]');
    const difficultyTag = getDifficultyTag(difficulty);
    
    rankings.push({
        difficulty: difficultyTag,
        time: time,
        date: new Date().toLocaleDateString()
    });

    rankings.sort((a, b) => a.time - b.time);

    // 난이도별 카운터를 동적으로 관리
    const difficultyCount = {};
    const filteredRankings = rankings.filter(rank => {
        const baseTag = rank.difficulty.startsWith('custom-') ? 'custom' : rank.difficulty;
        difficultyCount[baseTag] = (difficultyCount[baseTag] || 0) + 1;
        return difficultyCount[baseTag] <= 10;
    });

    localStorage.setItem(RANKING_KEY, JSON.stringify(filteredRankings));
    loadRanking('all');
}

function loadRanking(difficulty = 'all') {
    const rankings = JSON.parse(localStorage.getItem(RANKING_KEY) || '[]');
    const tbody = document.getElementById('rankingBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let filteredRankings = rankings;
    if (difficulty !== 'all') {
        if (difficulty === 'custom') {
            filteredRankings = rankings.filter(rank => rank.difficulty.startsWith('custom-'));
        } else {
            filteredRankings = rankings.filter(rank => rank.difficulty === difficulty);
        }
    }

    filteredRankings.sort((a, b) => a.time - b.time);

    if (filteredRankings.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = '<td colspan="4">등록된 기록이 없습니다.</td>';
        return;
    }

    filteredRankings.forEach((ranking, index) => {
        const row = tbody.insertRow();
        const medalClass = ['gold', 'silver', 'bronze'][index] || '';
        row.className = medalClass;
        
        let difficultyLabel;
        if (ranking.difficulty.startsWith('custom-')) {
            const size = ranking.difficulty.split('-')[1];
            difficultyLabel = `Custom (${size}×${size})`;
        } else {
            difficultyLabel = ranking.difficulty.charAt(0).toUpperCase() + ranking.difficulty.slice(1);
        }

        const difficultyClass = ranking.difficulty.startsWith('custom-') ? 'custom' : ranking.difficulty;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="difficulty-tag ${difficultyClass}">${difficultyLabel}</span></td>
            <td>${ranking.time}초</td>
            <td>${ranking.date}</td>
        `;
    });
}

function openRanking() {
    const modal = document.getElementById('rankingModal');
    if (modal) {
        modal.style.display = 'block';
        loadRanking('all');
    }
}

function closeRanking() {
    const modal = document.getElementById('rankingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}