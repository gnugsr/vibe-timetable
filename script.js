// 시간표 데이터 저장
const schedule = {};

// 커스텀 커서 구현
function setupCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // 마우스 움직임 감지
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 부드러운 움직임 애니메이션
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // 페이지를 벗어나면 커서 숨기기
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadScheduleFromLocalStorage();
    renderSchedule();
    setupFormListener();
    setupCustomCursor();
});

// 폼 제출 이벤트
function setupFormListener() {
    const form = document.getElementById('scheduleForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addLecture();
    });
}

// 강의 추가 함수
function addLecture() {
    const day = document.getElementById('lectureDay').value;
    const period = document.getElementById('lecturePeriod').value;
    const lectureName = document.getElementById('lectureName').value;
    const lectureRoom = document.getElementById('lectureRoom').value;
    const lectureTime = document.getElementById('lectureTime').value;

    if (!day || !period || !lectureName || !lectureRoom || !lectureTime) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    // 이미 해당 칸에 강의가 있는지 확인
    const key = `${day}-${period}`;
    if (schedule[key]) {
        const confirmOverwrite = confirm('이미 강의가 있습니다. 덮어쓰시겠습니까?');
        if (!confirmOverwrite) return;
    }

    // 강의 정보 저장
    schedule[key] = {
        name: lectureName,
        room: lectureRoom,
        time: lectureTime
    };

    // 로컬스토리지에 저장
    saveScheduleToLocalStorage();

    // 시간표 업데이트
    renderSchedule();

    // 폼 초기화
    document.getElementById('scheduleForm').reset();
    
    alert('강의가 추가되었습니다!');
}

// 시간표 렌더링
function renderSchedule() {
    const days = ['월', '화', '수', '목', '금'];
    
    // 모든 셀 초기화
    const subjects = document.querySelectorAll('.subject');
    subjects.forEach(cell => {
        cell.textContent = '';
        cell.classList.add('empty');
        cell.onclick = null;
    });

    // 저장된 강의 표시
    for (const key in schedule) {
        const [day, period] = key.split('-');
        const lecture = schedule[key];
        
        const cell = document.querySelector(
            `.subject[data-day="${day}"][data-period="${period}"]`
        );
        
        if (cell) {
            cell.textContent = lecture.name;
            cell.classList.remove('empty');
            cell.classList.add('has-lecture');
            
            // 클릭 시 강의 정보 표시 및 삭제 옵션
            cell.onclick = function() {
                showLectureInfo(day, period, lecture);
            };
        }
    }
}

// 강의 정보 팝업 표시
function showLectureInfo(day, period, lecture) {
    const days = ['월', '화', '수', '목', '금'];
    const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시'];
    
    const message = `
📚 강의 정보

강의명: ${lecture.name}
강의실: ${lecture.room}
수업시간: ${lecture.time}

요일: ${days[day]} / 교시: ${periods[period]}

❌ 이 강의를 삭제하시겠습니까?
    `;
    
    if (confirm(message)) {
        deleteLecture(day, period);
    }
}

// 강의 삭제 함수
function deleteLecture(day, period) {
    const key = `${day}-${period}`;
    delete schedule[key];
    
    // 로컬스토리지 업데이트
    saveScheduleToLocalStorage();
    
    // 시간표 업데이트
    renderSchedule();
    
    alert('강의가 삭제되었습니다!');
}

// 로컬스토리지에 저장
function saveScheduleToLocalStorage() {
    localStorage.setItem('vibeSchedule', JSON.stringify(schedule));
}

// 로컬스토리지에서 불러오기
function loadScheduleFromLocalStorage() {
    const saved = localStorage.getItem('vibeSchedule');
    if (saved) {
        const data = JSON.parse(saved);
        for (const key in data) {
            schedule[key] = data[key];
        }
    }
}
