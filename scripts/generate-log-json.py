#!/usr/bin/env python3
"""
generate-log-json.py
扫描 projects/incubated/{proj}/ 目录，解析各阶段文件，
生成结构化的 {proj}-log.json

策略：内容优先匹配，fallback 到 extract_bold() 确保不空
"""
import json
import re
import sys
from pathlib import Path

WORKSPACE = Path("/root/.openclaw/workspace/projects/incubated")
OUTPUT_BASE = Path("/usr/share/nginx/html/showcase/api")

PHASE_FILES = {
    "research": "research.md",
    "spec": "SPEC.md",
    "plan": "PLAN.md",
    "design": ["design-system.md", "DESIGN.md"],
}
PHASE_NAMES = {
    "research": "市场调研",
    "spec": "产品定义",
    "plan": "开发计划",
    "design": "设计系统",
}


def warn(proj: str, phase: str, field: str, msg: str):
    print(f"  [WARN] {proj}/{phase} {field}: {msg}", file=sys.stderr)


def extract_bold(text: str) -> list:
    """提取 **加粗** 和 ### 标题内容作为降级 fallback"""

    results = []
    for m in re.findall(r'\*\*([^*]+)\*\*', text):
        s = m.strip()
        if 3 < len(s) < 80:
            results.append(s)
    for m in re.findall(r'^#{1,3}\s+([^\n]+)', text, re.MULTILINE):
        s = m.strip()
        if 3 < len(s) < 80:
            results.append(s)
    return results[:15]


def extract_tech(text: str) -> list:
    """提取技术栈"""
    techs = re.findall(
        r'\b(React|TypeScript|Tailwind|Vite|Python|Node|Vue|Svelte|PostgreSQL|Redis|Docker|prismjs|html-to-image|zustand|lucide-react)\b',
        text
    )
    return list(set(techs))


def extract_done_items(text: str) -> list:
    done = re.findall(r'- \[x\]\s+([^\n`]+)', text)
    return [f"[完成] {d.strip()}" for d in done if len(d.strip()) > 3]


def extract_pending_items(text: str) -> list:
    pending = re.findall(r'- \[ \]\s+([^\n`]+)', text)
    return [f"[待完成] {p.strip()}" for p in pending if len(p.strip()) > 3]


def fallback(text: str, phase: str) -> dict:
    """当主解析返回空时，提取加粗/标题作为降级数据"""
    items = extract_bold(text)
    return {
        "decisions": items[:4],
        "milestones": items[4:10],
        "tech_choices": extract_tech(text),
    }


def parse_research(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []

    # --- 优先：结构化 "key: value" 格式（每行以 key: 开头）---
    _sd, _sm = [], []
    for _line in text.split('\n'):
        _line = _line.strip()
        if not _line: continue
        _m = re.match(r'^(市场|趋势\d*|竞品|目标用户|技术栈)[:：]\s*(.+)$', _line)
        if _m:
            _k, _v = _m.group(1), _m.group(2).strip()
            if _v:
                if re.match(r'^趋势\d+$', _k):
                    _sm.append(f"{_k}: {_v[:80]}")
                else:
                    _sd.append(f"{_k}: {_v[:90]}")
    # 如果结构化格式有内容，跳过 fallback
    if _sd or _sm:
        return {
            "bytes": len(text.encode('utf-8')),
            "summary": '',
            "duration": None,
            "decisions": _sd,
            "milestones": _sm,
            "tech_choices": [],
        }

    # 按 SKILL.md 定义的标准节结构拆分，不猜句子边界
    sections = {}
    for match in re.finditer(r'^##\s+([^\n]+)', text, re.MULTILINE):
        sections[match.group(1).strip()] = match.start()

    def get_section(name_prefix: str) -> str:
        """提取指定节标题下的所有内容（到下一个 ## 节为止）"""
        matches = [(k, v) for k, v in sections.items() if k.startswith(name_prefix)]
        if not matches:
            return ""
        # 取最长匹配（最具体）
        _, start = sorted(matches, key=lambda x: len(x[0]))[-1]
        end = len(text)
        for k, v in sections.items():
            if v > start:
                end = min(end, v)
        return text[start:end]

    # 市场数据：提取含 $ 或 亿 的数字段落
    mkt = get_section("市场数据")
    mkt_clean = re.sub(r'^\s*>\s*', '', mkt, flags=re.MULTILINE)
    for line in mkt_clean.split('\n'):
        line = line.strip()
        if not line or line.startswith('-') or line.startswith('##'):
            continue
        # 提取含市场规模信息的句子
        parts = re.split(r'[；;]', line)
        for p in parts:
            p = p.strip()
            if len(p) > 8 and ('$' in p or '亿' in p or 'B' in p.upper()) and ('CAGR' in p or '增长' in p or '规模' in p):
                decisions.append(f"市场: {p[:90]}")
                break
        if len(decisions) >= 2:
            break

    # 趋势分析：直接提取 - **趋势N**: xxx 格式
    trends_section = get_section("趋势分析")
    for m in re.finditer(r'-\s+\*\*趋势\s*(\d+)\*\*[:：]\s*([^\n]+)', trends_section):
        num, name = m.group(1), m.group(2).strip()
        milestones.append(f"趋势{num}: {name}")
    # Fallback: - 趋势N: xxx 格式（无星号）
    if not milestones:
        for m in re.finditer(r'^-\s*趋势\s*(\d+)[:：]\s*([^\n]+)', trends_section, re.MULTILINE):
            num, name = m.group(1), m.group(2).strip()
            milestones.append(f"趋势{num}: {name}")

    # 竞品分析：直接提取 - **竞品名称**: 格式
    comp_section = get_section("竞品分析")
    for m in re.finditer(r'\*\*([^*]+)\*\*[:：]', comp_section):
        name = m.group(1).strip()
        if len(name) > 1:
            decisions.append(f"竞品: {name}")

    # 目标用户：blockquote 内容
    user_section = get_section("目标用户")
    user_clean = re.sub(r'^\s*>\s*', '', user_section, flags=re.MULTILINE).strip()
    if user_clean:
        decisions.append(f"目标用户: {user_clean[:80]}")

    # 技术栈建议：blockquote 或无序列表
    tech_section = get_section("技术栈建议")
    tech_clean = re.sub(r'^\s*>\s*', '', tech_section, flags=re.MULTILINE).strip()
    if tech_clean:
        techs = re.findall(r'[\w+#]+', tech_clean)
        techs = [t for t in techs if len(t) > 1 and t not in ('和', '或', '等', '如')]
        decisions.append(f"技术栈: {', '.join(techs[:8])}")

    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('>') and not l.startswith('#') and not l.startswith('---')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:8],
        "milestones": milestones[:8],
        "tech_choices": [],
    }

    # Fallback: 如果市场数据为空（SKILL.md 节结构被跳过），用 $ 定位原始文本
    has_market = any('市场' in d for d in decisions)
    if not has_market:
        for line in text.split('\n'):
            if '$' in line and len(line) > 15:
                decisions.insert(0, f"市场规模: {line.strip()[:70]}")
                break

    return result
def parse_spec(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []

    # 按 SKILL.md 新格式的节结构拆分
    sections = {}
    for match in re.finditer(r'^##\s+([^\n]+)', text, re.MULTILINE):
        sections[match.group(1).strip()] = match.start()

    def get_section(name_prefix: str) -> str:
        matches = [(k, v) for k, v in sections.items() if k.startswith(name_prefix)]
        if not matches:
            return ""
        _, start = sorted(matches, key=lambda x: len(x[0]))[0]
        end = len(text)
        for k, v in sections.items():
            if v > start:
                end = min(end, v)
        return text[start:end]

    # 产品名
    for pat in [r'\*\*产品名[：:]\s*([^\n]+)\*\*', r'产品名[：:]\s*([^\n]+)']:
        m = re.search(pat, text)
        if m:
            decisions.append(f"产品名: {m.group(1).strip()}")
            break

    # 一句话描述
    for pat in [r'\*\*一句话描述\*\*[：:]\s*([^\n]+)', r'一句话描述[：:]\s*([^\n]+)']:
        m = re.search(pat, text)
        if m:
            decisions.append(f"定位: {m.group(1).strip()}")
            break

    # 解决问题
    solve = get_section("解决问题")
    solve_clean = re.sub(r'^\s*>\s*', '', solve, flags=re.MULTILINE).strip()
    if solve_clean:
        decisions.append(f"解决: {solve_clean[:80]}")

    # 用户画像 — 提取 - **用户X**: xxx 格式
    user_section = get_section("用户画像")
    for m in re.finditer(r'- \*\*([^:]+)\*\*[:：]\s*([^\n]+)', user_section):
        label = m.group(1).strip()
        content = m.group(2).strip()
        if label and content:
            decisions.append(f"用户: {label}—{content[:60]}")

    # 核心功能 — 提取 ### 1.1 <功能名称> 下的 描述/用户流程/输入/输出/边界
    func_section = get_section("核心功能")
    func_blocks = re.split(r'^###\s+\d+\.\d+', func_section, flags=re.MULTILINE)
    for block in func_blocks[1:]:
        # 取第一行作为功能名
        lines = block.strip().split('\n')
        if not lines:
            continue
        first = lines[0].strip()
        if not first:
            continue
        # 提取描述（- 描述：xxx）
        desc = re.search(r'- 描述[：:]\s*([^\n]+)', block)
        if desc:
            milestones.append(f"功能: {desc.group(1).strip()}")
        elif len(first) > 2:
            milestones.append(f"功能: {first[:60]}")

    # 技术决策
    tech_section = get_section("技术决策")
    tech_clean = re.sub(r'^\s*>\s*', '', tech_section, flags=re.MULTILINE).strip()
    if tech_clean:
        # 提取每行（去掉 - 和空白）
        for line in tech_clean.split('\n'):
            line = line.strip().lstrip('-').strip()
            if line and len(line) > 3:
                decisions.append(f"技术: {line[:70]}")

    # 数据模型
    data_section = get_section("数据模型")
    for m in re.finditer(r'`(\w+)`', data_section):
        entity = m.group(1).strip()
        if len(entity) > 1:
            decisions.append(f"数据: {entity}")

    # 边界情况
    edge_section = get_section("边界情况")
    for m in re.finditer(r'([^：:]+)[：:]\s*([^\n]+)', edge_section):
        key = m.group(1).strip()
        val = m.group(2).strip()
        if key and val and len(val) > 3:
            milestones.append(f"边界: {key}—{val[:50]}")

    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('>')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:8],
        "milestones": milestones[:8],
        "tech_choices": [],
    }

    if not result["decisions"] and not result["milestones"]:
        fb = fallback(text, "spec")
        result["decisions"] = fb["decisions"]
        result["milestones"] = fb["milestones"]
        warn(path.parent.name, "spec", "all", "used bold fallback")

    return result


def parse_plan(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []

    # 按 SKILL.md 新格式的节结构拆分
    sections = {}
    for match in re.finditer(r'^##\s+([^\n]+)', text, re.MULTILINE):
        sections[match.group(1).strip()] = match.start()

    def get_section(name_prefix: str) -> str:
        matches = [(k, v) for k, v in sections.items() if k.startswith(name_prefix)]
        if not matches:
            return ""
        _, start = sorted(matches, key=lambda x: len(x[0]))[-1]
        end = len(text)
        for k, v in sections.items():
            if v > start:
                end = min(end, v)
        return text[start:end]

    # 开发步骤 — 提取每个 Step 的名称、时间估算、完成标准
    steps_section = get_section("开发步骤")
    step_blocks = re.split(r'^###\s+Step\s*\d+[：:]\s*', steps_section, flags=re.MULTILINE)
    for block in step_blocks[1:]:
        lines = block.strip().split('\n')
        if not lines:
            continue
        # 第一行：阶段名称 + 时间
        header = lines[0].strip()
        time_m = re.search(r'[（(]预计\s*(\d+)\s*分钟[）)]', header)
        time_str = f"（{time_m.group(1)}分钟）" if time_m else ""
        step_name = re.sub(r'[（(]预计.*?[）)]', '', header).strip()
        if step_name:
            decisions.append(f"Step: {step_name}{time_str}")
        # 完成标准
        std_m = re.search(r'完成标准[：:]\s*([^\n]+)', block)
        if std_m:
            milestones.append(f"标准: {std_m.group(1).strip()[:60]}")
        # 待完成步骤（- [ ] xxx）
        for m in re.finditer(r'- \[ \]\s+([^\n]+)', block):
            item = m.group(1).strip()
            if item and len(item) > 3:
                milestones.append(f"[待完成] {item[:70]}")
        # 已完成步骤（- [x] xxx）
        for m in re.finditer(r'- \[x\]\s+([^\n]+)', block):
            item = m.group(1).strip()
            if item and len(item) > 3:
                milestones.append(f"[完成] {item[:70]}")

    # 里程碑表格 — 提取 M1/M2/M3 等
    ms_section = get_section("里程碑")
    ms_rows = re.findall(r'\|\s*M\d+[：:]\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|', ms_section)
    for name, criteria in ms_rows:
        name = name.strip()
        criteria = criteria.strip()
        if name:
            decisions.append(f"里程碑: {name}")
        if criteria and len(criteria) > 2:
            milestones.append(f"验收: {criteria[:60]}")

    # 如果新格式解析为空，fallback 到旧逻辑
    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('>')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:8],
        "milestones": milestones[:10],
        "tech_choices": [],
    }

    if not result["decisions"] and not result["milestones"]:
        fb = fallback(text, "plan")
        result["decisions"] = fb["decisions"]
        result["milestones"] = fb["milestones"]
        warn(path.parent.name, "plan", "all", "used bold fallback")

    return result


def main():
    parser_map = {
        "research": parse_research,
        "spec": parse_spec,
        "plan": parse_plan,
    }

    for proj_dir in sorted(WORKSPACE.iterdir()):
        if not proj_dir.is_dir():
            continue
        name = proj_dir.name
        log_data = {}
        for phase, filename in PHASE_FILES.items():
            if isinstance(filename, list):
                path = None
                for f in filename:
                    p = proj_dir / f
                    if p.exists():
                        path = p
                        break
            else:
                path = proj_dir / filename

            if not path or not path.exists():
                continue

            parser = parser_map.get(phase)
            if parser:
                try:
                    log_data[phase] = parser(path)
                except Exception as e:
                    warn(name, phase, "parse", str(e))
                    log_data[phase] = {"bytes": 0, "summary": "", "decisions": [], "milestones": [], "tech_choices": []}

        if log_data:
            out_path = OUTPUT_BASE / f"{name}-log.json"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(log_data, f, ensure_ascii=False, indent=2)
            print(f"Generated: {out_path.name}")


if __name__ == "__main__":
    main()
