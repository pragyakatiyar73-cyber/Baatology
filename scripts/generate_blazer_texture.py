import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_blazer_texture():
    src_path = 'public/models/top_texture_rgb.png'
    out_path = 'public/models/blazer_texture.png'

    im = Image.open(src_path).convert('RGBA')
    w, h = im.size

    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font_bold = 'C:/Windows/Fonts/segoeuib.ttf'
    if not os.path.exists(font_bold):
        font_bold = 'C:/Windows/Fonts/arialbd.ttf'

    font_regular = 'C:/Windows/Fonts/segoeui.ttf'
    if not os.path.exists(font_regular):
        font_regular = 'C:/Windows/Fonts/arial.ttf'

    # Executive Color Palette: Deep Midnight Navy Tailored Suit
    SUIT_NAVY = (22, 30, 52, 255)
    SUIT_LAPEL = (16, 22, 40, 255)
    SUIT_LAPEL_EDGE = (56, 189, 248, 230) # Cyber cyan piping
    GOLD_ACCENT = (218, 180, 60, 255)
    GOLD_LIGHT = (255, 230, 130, 255)
    GOLD_SHADOW = (130, 95, 25, 255)
    WHITE_SHIRT = (252, 254, 255, 255)
    SHIRT_SHADOW = (210, 220, 235, 255)

    # ─────────────────────────────────────────────────────────────────
    # 1. COMPLETELY UNIFORM LUXURY SUIT WOOL (No panel seam artifacts)
    # ─────────────────────────────────────────────────────────────────
    orig_pixels = im.load()
    overlay_pixels = overlay.load()

    base_r, base_g, base_b = 24, 32, 54

    for y in range(h):
        for x in range(w):
            r, g, b, a = orig_pixels[x, y]
            if a > 40:
                # Luminance for minor wrinkle preservation
                lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
                shade = (lum - 0.35) * 6.0 # Very subtle so color is 100% consistent across panels
                nr = max(18, min(45, int(base_r + shade)))
                ng = max(24, min(55, int(base_g + shade)))
                nb = max(42, min(80, int(base_b + shade * 1.2)))

                # Subtle wool twill weave pattern
                weave = ((x * 13 + y * 29) % 5) - 2
                nr = max(0, min(255, nr + weave))
                ng = max(0, min(255, ng + weave))
                nb = max(0, min(255, nb + weave))
                overlay_pixels[x, y] = (nr, ng, nb, 255)

    # ─────────────────────────────────────────────────────────────────
    # 2. INNER WHITE FORMAL SHIRT / BLOUSE (Center V-Opening)
    # ─────────────────────────────────────────────────────────────────
    shirt_pts = [
        (752, 105), # Top left collar
        (830, 105), # Top right collar
        (825, 160),
        (797, 268), # V-neck bottom
        (785, 268),
        (757, 160),
    ]
    draw.polygon(shirt_pts, fill=WHITE_SHIRT)

    # Formal collar folds & placket
    draw.polygon([(752, 105), (785, 175), (765, 175)], fill=(240, 244, 250, 255))
    draw.polygon([(830, 105), (797, 175), (817, 175)], fill=(240, 244, 250, 255))

    draw.line([(752, 105), (791, 185)], fill=SHIRT_SHADOW, width=3)
    draw.line([(830, 105), (791, 185)], fill=SHIRT_SHADOW, width=3)
    draw.line([(791, 185), (791, 268)], fill=SHIRT_SHADOW, width=2)

    # Pearl buttons on shirt
    for sy in [210, 242]:
        draw.ellipse([789, sy - 2, 793, sy + 2], fill=(245, 248, 255, 255), outline=(180, 192, 210, 255), width=1)

    # ─────────────────────────────────────────────────────────────────
    # 3. TAILORED NOTCH LAPELS (Clean & Symmetrical)
    # ─────────────────────────────────────────────────────────────────
    # Left Lapel (Viewer's left, X < 791)
    l_lapel = [
        (752, 105),
        (710, 138), # Collar notch outer
        (722, 155), # Notch inner step
        (702, 205), # Lapel peak
        (786, 312), # Center crossover
        (791, 268), # V-neck base
        (757, 160),
    ]
    shadow_lapel = [(p[0] - 4, p[1] + 3) for p in l_lapel]
    draw.polygon(shadow_lapel, fill=(10, 14, 26, 170))
    draw.polygon(l_lapel, fill=SUIT_LAPEL)
    draw.line([(752, 105), (710, 138), (722, 155), (702, 205), (786, 312)], fill=SUIT_LAPEL_EDGE, width=2)

    # Right Lapel (Viewer's right, X > 791)
    r_lapel = [
        (830, 105),
        (872, 138), # Collar notch outer
        (860, 155), # Notch inner step
        (880, 205), # Lapel peak
        (796, 312), # Center crossover
        (791, 268), # V-neck base
        (825, 160),
    ]
    shadow_r = [(p[0] + 4, p[1] + 3) for p in r_lapel]
    draw.polygon(shadow_r, fill=(10, 14, 26, 170))
    draw.polygon(r_lapel, fill=SUIT_LAPEL)
    draw.line([(830, 105), (872, 138), (860, 155), (880, 205), (796, 312)], fill=SUIT_LAPEL_EDGE, width=2)

    # Center Front Seam
    draw.line([(791, 312), (791, 480)], fill=(10, 14, 26, 255), width=3)
    draw.line([(792, 312), (792, 480)], fill=(45, 62, 98, 180), width=1)

    # ─────────────────────────────────────────────────────────────────
    # 4. LUXURY EMBOSSED GOLD BUTTONS
    # ─────────────────────────────────────────────────────────────────
    button_y_positions = [335, 395, 455]
    for by in button_y_positions:
        draw.ellipse([784, by - 6, 798, by + 9], fill=(8, 12, 24, 180))
        draw.ellipse([783, by - 8, 799, by + 8], fill=GOLD_ACCENT, outline=GOLD_SHADOW, width=2)
        draw.ellipse([785, by - 6, 797, by + 6], fill=GOLD_LIGHT)
        draw.ellipse([787, by - 5, 791, by - 2], fill=(255, 255, 240, 255))
        draw.point([(789, by - 2), (793, by - 2), (789, by + 2), (793, by + 2)], fill=GOLD_SHADOW)

    # ─────────────────────────────────────────────────────────────────
    # 5. LUXURY EXECUTIVE "AuraGD" BADGE & EMBROIDERY ON CHEST
    # ─────────────────────────────────────────────────────────────────
    # Positioned cleanly on the front breast panel facing the camera
    bx0, by0 = 688, 238
    bx1, by1 = 775, 292

    # Welt pocket horizontal welt bar above badge
    draw.polygon([(682, 226), (776, 222), (776, 234), (682, 238)], fill=(12, 18, 34, 255))
    draw.line([(682, 226), (776, 222)], fill=GOLD_ACCENT, width=2)

    # Pocket silk pocket square peeking out (pure white & cyber cyan tip)
    draw.polygon([(714, 224), (728, 206), (742, 223)], fill=(255, 255, 255, 255))
    draw.polygon([(728, 223), (740, 210), (752, 222)], fill=(56, 189, 248, 230))

    # Drop shadow behind badge
    draw.rounded_rectangle([bx0 + 2, by0 + 3, bx1 + 2, by1 + 3], radius=7, fill=(6, 10, 20, 210))
    # Badge plate: Midnight titanium backing
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=7, fill=(10, 16, 34, 255), outline=GOLD_ACCENT, width=2)
    # Inner glowing cyan border
    draw.rounded_rectangle([bx0 + 3, by0 + 3, bx1 - 3, by1 - 3], radius=5, outline=(56, 189, 248, 220), width=1)

    # Typography: "AuraGD" in bold, legible, elegant typography
    font_brand = ImageFont.truetype(font_bold, 18)
    font_tag = ImageFont.truetype(font_bold, 8)

    # Measure "Aura" and "GD"
    w_aura = draw.textlength("Aura", font=font_brand)
    w_gd = draw.textlength("GD", font=font_brand)
    total_w = w_aura + w_gd
    text_x = bx0 + (bx1 - bx0 - total_w) // 2
    text_y = by0 + 6

    # Deep text shadow
    draw.text((text_x + 1, text_y + 1), "AuraGD", font=font_brand, fill=(0, 0, 0, 240))
    # "Aura" in crisp cyber cyan
    draw.text((text_x, text_y), "Aura", font=font_brand, fill=(56, 189, 248, 255))
    # "GD" in radiant metallic gold
    draw.text((text_x + w_aura, text_y), "GD", font=font_brand, fill=GOLD_LIGHT)

    # Subtitle: "AI MENTOR" in polished white with gold trim
    sub_text = "AI MENTOR"
    w_sub = draw.textlength(sub_text, font=font_tag)
    sub_x = bx0 + (bx1 - bx0 - w_sub) // 2
    sub_y = text_y + 23
    draw.text((sub_x + 1, sub_y + 1), sub_text, font=font_tag, fill=(0, 0, 0, 200))
    draw.text((sub_x, sub_y), sub_text, font=font_tag, fill=(240, 246, 255, 255))

    # Subtle gold metallic lapel pin on opposite lapel
    draw.ellipse([870, 180, 882, 192], fill=GOLD_ACCENT, outline=GOLD_SHADOW, width=1)
    draw.ellipse([872, 182, 880, 190], fill=GOLD_LIGHT)
    draw.point([874, 184], fill=(255, 255, 255, 255))

    # ─────────────────────────────────────────────────────────────────
    # 6. SLEEVE CUFFS & GOLD BUTTONS
    # ─────────────────────────────────────────────────────────────────
    cuff_y = 815
    for cx in [435, 455, 475]:
        draw.ellipse([cx - 5, cuff_y - 5, cx + 5, cuff_y + 5], fill=GOLD_ACCENT, outline=GOLD_SHADOW, width=1)
        draw.ellipse([cx - 3, cuff_y - 3, cx + 3, cuff_y + 3], fill=GOLD_LIGHT)

    # Composite overlay onto original image
    final_im = Image.alpha_composite(im, overlay)
    final_im.convert('RGB').save(out_path, 'PNG')
    print('Successfully generated executive AuraGD blazer texture:', out_path)

if __name__ == '__main__':
    create_blazer_texture()
