def parse_design(path: Path, english: bool = False) -> dict:
    """解析 design-system.md 或 DESIGN.md"""
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []
    tech_choices = []

    if english:
        # English format (DESIGN.md)
        project = re.search(r'\*\*Project:\*\* ([^\n]+)', text)
        if project: decisions.append("产品: " + project.group(1).strip())
        style_m = re.search(r'\*\*Style:\*\* ([^\n]+)', text)
        if style_m: decisions.append("风格: " + style_m.group(1).strip())
        version = re.search(r'\*\*Version:\*\* ([^\n]+)', text)
        if version: decisions.append("版本: " + version.group(1).strip())
        colors = re.findall(r'`(--[a-z-]+)`\s+\|\s+#([0-9a-fA-F]+)', text)
        for name, hex in colors[:6]: decisions.append("色 -" + name + ": #" + hex)
        heading = re.search(r'\*\*Heading Font:\*\* ([^\n]+)', text)
        if heading: decisions.append("标题字体: " + heading.group(1).strip())
        ui = re.search(r'\*\*UI Font:\*\* ([^\n]+)', text)
        if ui: decisions.append("正文字体: " + ui.group(1).strip())
        tech = re.findall(r'(React|TypeScript|Tailwind|Vite|PostCSS|Vue)', text)
        for t in set(tech): tech_choices.append(t)
    else:
        # Chinese format (design-system.md)
        direction = re.search(r'设计方向[：:]\s*([^\n]+)', text)
        if direction: decisions.append("设计方向: " + direction.group(1).strip())
        colors = re.findall(r'`--([a-z-]+)`\s*\|\s*#([0-9a-fA-F]+)', text)
        for name, hex in colors[:6]: decisions.append("色彩 -" + name + ": #" + hex)
        font = re.search(r'(font|字体)[：:]\s*([^\n]+)', text)
        if font: decisions.append("字体: " + font.group(2).strip())
        tech = re.findall(r'(React|TypeScript|Tailwind|Vite|PostCSS)', text)
        for t in set(tech): tech_choices.append(t)

    bytes_count = len(text.encode("utf-8"))
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith("|") and not l.startswith("#")]
    summary = "\n".join(lines[:6])[:300]

    return {
        "bytes": bytes_count,
        "summary": summary,
        "duration": None,
        "decisions": decisions[:8],
        "milestones": milestones,
        "tech_choices": list(set(tech_choices)),
    }
