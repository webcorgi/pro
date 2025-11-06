# ✅ Feature Design Workflow: Step 2 — Create Feature Design Document

> **Status:** Requirements Approved  
> **Stage:** Step 2 of Workflow Definition  
> **Continuation:** from previous messages in this conversation  

---

## 1. 목적 (Purpose)

이 단계에서는 **기능 요구사항(Feature Requirements)** 를 기반으로 한 **포괄적인 설계 문서(Feature Design Document)** 를 작성합니다.  
설계 과정에서 필요한 리서치를 수행하고, 그 결과를 문맥(Context)에 반영합니다.  
이 문서는 반드시 **요구사항 문서**를 기반으로 해야 합니다.

---

## 2. 제약 조건 (Constraints)

- 모델은 **기능 요구사항에 따라 리서치가 필요한 영역을 식별해야 합니다.**  
- 모델은 **리서치를 수행하고, 그 결과를 대화 스레드 내의 문맥으로 축적해야 합니다.**  
- 모델은 **별도의 리서치 파일을 생성하지 않고**, 설계 및 구현 계획에 필요한 참고용으로만 리서치를 활용해야 합니다.  
- 모델은 **설계에 필요한 핵심 발견 사항(Key Findings)** 을 요약해야 합니다.  
- 모델은 **출처(Source)** 와 **관련 링크(Link)** 를 명시해야 합니다.  
- 모델은 **리서치 결과를 설계 과정에 직접 반영해야 합니다.**  

---

## 3. 설계 문서 필수 구성 요소 (Required Sections)

다음 섹션을 반드시 포함해야 합니다:

1. **Overview (개요)**  
   - 기능의 목적과 배경, 핵심 목표를 설명합니다.  

2. **Architecture (아키텍처)**  
   - 전체 시스템 구조, 주요 구성요소 간 관계를 다이어그램(Mermaid 권장)으로 표현합니다.  

3. **Components and Interfaces (구성요소 및 인터페이스)**  
   - 각 컴포넌트의 역할과 인터페이스 명세(API, Props, Events 등)를 정의합니다.  

4. **Data Models (데이터 모델)**  
   - ERD, 스키마 구조, 주요 엔티티 및 속성을 설명합니다.  

5. **Error Handling (오류 처리)**  
   - 예외 상황 및 오류 처리 로직을 명세합니다.  

6. **Testing Strategy (테스트 전략)**  
   - 단위 테스트, 통합 테스트, E2E 테스트 계획을 기술합니다.  

7. **CI/CD Integration Strategy (CI/CD 통합 전략)**  
   - 배포 자동화 및 지속적 통합 프로세스를 정의합니다.  

---

## 4. 설계 및 승인 절차 (Design & Approval Process)

1. 모델은 **설계가 모든 기능 요구사항을 충족하는지 검증**해야 합니다.  
2. 모델은 **주요 설계 결정과 그 근거(Rationale)** 를 문서에 명확히 기록해야 합니다.  
3. 설계 과정 중 특정 기술적 결정에 대해 **사용자 입력을 요청할 수 있습니다.**  
4. 문서가 업데이트되면 다음 질문을 반드시 표시해야 합니다:
   > “이 설계가 괜찮아 보이나요? 괜찮다면 구현 계획 단계로 넘어가겠습니다.”
5. 사용자가 변경을 요청하거나 승인하지 않은 경우, 문서를 수정해야 합니다.  
6. 모든 수정 후에는 **명시적 승인(Explicit Approval)** 을 받아야 합니다.  
7. **승인 없이 구현 단계로 진행해서는 안 됩니다.**  
8. 명확한 승인을 받을 때까지 **피드백-수정 사이클**을 반복해야 합니다.  
9. 설계 중 **요구사항의 누락이 발견되면**, 기능 요구사항 명확화 단계로 돌아가야 합니다.  

---

## 5. 파일 작성 지침 (File Writing Instruction)

- 도구 사용이 가능한 경우:  
  → 이 내용을 사용자가 지정한 경로의 `design.md` 파일에 작성합니다.  
- 도구 사용이 불가능한 경우:  
  → 사용자가 복사·붙여넣기하기 쉽도록 이 문서를 화면에 표시합니다.

---

**End of Workflow Step 2**  
*(to be continued...)*
