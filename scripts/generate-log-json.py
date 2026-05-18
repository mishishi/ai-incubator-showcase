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
    return [f"✓ {d.strip()}" for d in done if len(d.strip()) > 3]


def extract_pending_items(text: str) -> list:
    pending = re.findall(r'- \[ \]\s+([^\n`]+)', text)
    return [f"○ {p.strip()}" for p in pending if len(p.strip()) > 3]


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

    # 市场数据
    mkt = re.findall(r'\$[\d.]+[MB].*?(?:CAGR|增长率|增长)', text[:500])
    if not mkt:
        mkt = re.findall(r'\$[\d.]+[MB]', text[:500])
    for m in mkt[:2]:
        decisions.append(f"市场: {m.strip()[:50]}")

    # 趋势标题 (### 趋势N 或 ## 趋势)
    trends = re.findall(r'趋势\s*(\d+)[：:]\s*([^\n]+)', text)
    for num, name in trends[:3]:
        milestones.append(f"趋势{num}: {name.strip()}")
    if not trends:
        # Try ## 趋势N：xxx format
        trends2 = re.findall(r'##\s+趋势\s*(\d+)[：:]\s*([^\n]+)', text, re.MULTILINE)
        for num, name in trends2[:3]:
            milestones.append(f"趋势{num}: {name.strip()}")

    # 竞品 (bold names in competitor section)
    competitors = re.findall(r'(?:^|\n)##?\s*.*?竞品.*?\n(.*?)(?=\n##|\Z)', text, re.DOTALL)
    if competitors:
        names = re.findall(r'\*\*([^*]{3,30})\*\*', competitors[0][:500])
        for n in names[:5]:
            decisions.append(f"竞品: {n.strip()}")
    else:
        # Try bold-only competitors
        bold = re.findall(r'\*\*([^*]{3,30})\*\*', text)
        for b in bold[:3]:
            s = b.strip()
            if len(s) > 3 and not any(c.isdigit() for c in s):
                decisions.append(f"竞品: {s}")

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

    # Fallback: if decisions+milestones are both empty, use bold items
    if not result["decisions"] and not result["milestones"]:
        fb = fallback(text, "research")
        result["decisions"] = fb["decisions"]
        result["milestones"] = fb["milestones"]
        warn(path.parent.name, "research", "all", "used bold fallback")

    return result


def parse_spec(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []

    # 产品名
    for pat in [r'\*\*产品名[：:]\s*([^\n]+)\*\*', r'产品名[：:]\s*([^\n]+)', r'项目名[：:]\s*([^\n]+)']:
        m = re.search(pat, text)
        if m:
            decisions.append(f"产品名: {m.group(1).strip()}")
            break

    # 一句话描述
    for pat in [r'一句话描述[：:]\s*([^\n]+)', r'\*\*一句话描述\*\*[：:]\s*([^\n]+)']:
        m = re.search(pat, text)
        if m:
            decisions.append(f"定位: {m.group(1).strip()}")
            break

    # 目标用户
    for pat in [r'目标用户[：:]\s*([^\n]+)', r'\*\*目标用户\*\*[：:]\s*([^\n]+)']:
        m = re.search(pat, text)
        if m:
            decisions.append(f"目标用户: {m.group(1).strip()}")
            break

    # 功能小节 (### 2.1 xxx) — filter technical details
    features = re.findall(r'^###\s+\d+\.\d+\s+([^\n]+)', text, re.MULTILINE)
    tech_keywords = ['状态管理', 'localStorage', 'Keys', '数据模型', '技术选型', '非功能', '模型', 'API', '接口', 'Store']
    for f in features:
        s = f.strip()
        if '(' in s or any(kw in s for kw in tech_keywords):
            continue
        if len(s) > 2:
            milestones.append(s)

    # 如果没有功能小节，提取加粗内容作为功能
    if not milestones:
        bold_items = re.findall(r'\*\*([^*]{5,50})\*\*', text)
        for item in bold_items[:6]:
            s = item.strip()
            if len(s) > 5:
                milestones.append(s)

    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('>')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:6],
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
    text = path.read_text(encoding='utf-8')
    decisions = []
    milestones = []

    # 阶段标题 — 支持 noctern (## 阶段一：xxx) 和 inkflow (## 开发步骤)
    stages = re.findall(r'## 阶段[一二三四五六]+[：:]\s*([^\n]+)', text)
    if stages:
        for name in stages[:6]:
            decisions.append("阶段: " + name.strip())
    else:
        dev_steps = re.search(r'## 开发步骤', text)
        if dev_steps:
            decisions.append("阶段: 开发步骤")

    # 完成项
    done = extract_done_items(text)
    milestones.extend(done[:8])

    # 待完成项
    pending = extract_pending_items(text)
    milestones.extend(pending[:6])

    # 编号步骤 (1. xxx) — skip bullets
    steps = re.findall(r'(?:^|\n)\d+\.\s+([^\n]{5,80})', text)
    for s in steps[:8]:
        s = s.strip()
        if s and len(s) > 3:
            milestones.append(s[:60])

    # 里程碑表格 (| M1：xxx |)
    milestone_rows = re.findall(r'\|\s*M\d+[：:]\s*([^\n|]+)', text)
    for m in milestone_rows[:5]:
        s = m.strip()
        if s: milestones.append(f"里程碑: {s}")

    # 简化决策表格
    fallback_rows = re.findall(r'\|\s*([^|]+)\s*\|\s*(?:降级|使用|直接|暂时)[^|]*\|', text)
    for f in fallback_rows[:4]:
        s = f.strip()
        if s and not s.startswith('情况') and '---' not in s:
            milestones.append(f"决策: {s}")

    tech = extract_tech(text)
    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('>') and not l.startswith('|')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:6],
        "milestones": milestones[:10],
        "tech_choices": list(set(tech)),
    }

    if not result["decisions"] and not result["milestones"]:
        fb = fallback(text, "plan")
        result["decisions"] = fb["decisions"]
        result["milestones"] = fb["milestones"]
        warn(path.parent.name, "plan", "all", "used bold fallback")

    return result


def parse_design(path: Path, english: bool = False) -> dict:
    text = path.read_text(encoding='utf-8')
    decisions = []
    milestones = []

    if english:
        project = re.search(r'\*\*Project:\*\* ([^\n]+)', text)
        if project: decisions.append(f"产品: {project.group(1).strip()}")
        style_m = re.search(r'\*\*Style:\*\* ([^\n]+)', text)
        if style_m: decisions.append(f"风格: {style_m.group(1).strip()}")
        version = re.search(r'\*\*Version:\*\* ([^\n]+)', text)
        if version: decisions.append(f"版本: {version.group(1).strip()}")
        colors = re.findall(r'`(--[a-z-]+)`\s+\|\s+#([0-9a-fA-F]+)', text)
        for name, hex in colors[:6]: decisions.append(f"色 -{name}: #{hex}")
        heading = re.search(r'\*\*Heading Font:\*\* ([^\n]+)', text)
        if heading: decisions.append(f"标题字体: {heading.group(1).strip()}")
        ui = re.search(r'\*\*UI Font:\*\* ([^\n]+)', text)
        if ui: decisions.append(f"正文字体: {ui.group(1).strip()}")
        mono = re.search(r'\*\*Mono Font:\*\* ([^\n]+)', text)
        if mono: decisions.append(f"代码字体: {mono.group(1).strip()}")
        tech = extract_tech(text)
    else:
        # 中文 design-system.md
        for pat in [r'设计方向[：:]\s*([^\n]+)', r'设计风格[：:]\s*([^\n]+)', r'风格预设[：:]\s*([^\n]+)']:
            m = re.search(pat, text)
            if m:
                decisions.append(f"设计方向: {m.group(1).strip()}")
                break

        # Color tokens in table format
        colors = re.findall(r'\|\s*`--([a-z-]+)`\s*\|\s*`#([0-9a-fA-F]+)`', text)
        for name, hex in colors[:6]: decisions.append(f"色彩 -{name}: #{hex}")

        # Also check ## 色彩系统 section
        color_section = re.search(r'## 色彩系统.*?(?=##|\Z)', text, re.DOTALL)
        if color_section:
            tokens = re.findall(r'`--([a-z-]+)`\s*\|\s*#([0-9a-fA-F]+)', color_section.group(0))
            for name, hex in tokens[:6]:
                name2 = f"色彩 -{name}"
                if name2 not in decisions:
                    decisions.append(name2)

        for pat in [r'字体[：:]\s*([^\n]+)', r'Heading\s+Font[：:]\s*([^\n]+)', r'标题字体[：:]\s*([^\n]+)', r'正文字体[：:]\s*([^\n]+)']:
            m = re.search(pat, text)
            if m:
                decisions.append(f"字体: {m.group(1).strip()}")
                break

        tech = extract_tech(text)

    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.startswith('|') and not l.startswith('#')]
    summary = '\n'.join(lines[:6])[:300]

    result = {
        "bytes": len(text.encode('utf-8')),
        "summary": summary,
        "duration": None,
        "decisions": decisions[:10],
        "milestones": milestones,
        "tech_choices": list(set(tech)),
    }

    if not result["decisions"]:
        fb = fallback(text, "design")
        result["decisions"] = fb["decisions"]
        warn(path.parent.name, "design", "decisions", "used bold fallback")

    return result


def generate_log(proj_dir: Path) -> dict:
    name = proj_dir.name
    log = {}
    for phase, filenames in PHASE_FILES.items():
        for fn in ([filenames] if isinstance(filenames, str) else filenames):
            file_path = proj_dir / fn
            if file_path.exists():
                break
        if file_path.exists():
            try:
                text = file_path.read_text(encoding='utf-8')
                has_chinese = bool(re.search(r'[\u4e00-\u9fff]', text[:500]))
                if phase == 'design':
                    log[phase] = parse_design(file_path, english=not has_chinese)
                elif phase == 'research':
                    log[phase] = parse_research(file_path)
                elif phase == 'spec':
                    log[phase] = parse_spec(file_path)
                elif phase == 'plan':
                    log[phase] = parse_plan(file_path)
            except Exception as e:
                warn(name, phase, "parse", str(e))
                text = file_path.read_text(encoding='utf-8')
                log[phase] = {
                    'bytes': len(text.encode('utf-8')),
                    'summary': text[:300],
                    'decisions': [],
                    'milestones': [],
                    'tech_choices': extract_tech(text),
                }
                warn(name, phase, "all", "exception fallback")
    return log


def main():
    OUTPUT_BASE.mkdir(parents=True, exist_ok=True)
    for proj_dir in sorted(WORKSPACE.iterdir()):
        if not proj_dir.is_dir():
            continue
        name = proj_dir.name
        print(f"Generating log for {name}...")
        log = generate_log(proj_dir)
        out_path = OUTPUT_BASE / f"{name}-log.json"
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print(f"  -> {out_path}")
    print("Done.")


if __name__ == '__main__':
    main()