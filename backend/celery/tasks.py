from celery import Celery


# Redis broker/backend (DB 0 for broker, 1 for results)
app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
)


@app.task(name="tasks.transform_prompt")
def transform_prompt(prompt: str) -> str:
    prompt = (prompt or "").strip()
    if not prompt:
        goal = "정보 부족"
    else:
        goal = prompt.replace("\n", " ")

    sections = [
        "목표:",
        f"- {goal}",
        "",
        "해야 할 작업:",
        "- 사용자 의도를 파악하고 핵심 요구를 추출",
        "- 요구사항을 간결한 명령문으로 재작성",
        "- 입력/출력 조건을 항목으로 정리",
        "- 불명확한 정보는 생성하지 않고 표시",
        "",
        "세부 조건",
        "- 과장, 감탄사, 불필요한 문장 제거",
        "- 사용자의 말투는 유지하되 표현을 명확하게 정제",
        "- 같은 입력에는 항상 동일한 출력 유지(결정론적)",
        "- 해석 불명확 시 \"정보 부족\"으로 명시",
        "- 창의성보다 명확성/재현성/구조화를 우선",
        "",
        "출력 형식 요구:",
        "- 섹션 제목은 '목표', '해야 할 작업', '세부 조건', '출력 형식 요구' 순서로 유지",
        "- 각 항목은 불렛(- )으로 표기",
        "- 여분의 해설/서문/후기는 포함하지 않음",
    ]
    return "\n".join(sections)

