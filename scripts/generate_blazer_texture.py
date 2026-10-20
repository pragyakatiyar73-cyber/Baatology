import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_futuristic_white_blazer_texture():
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

    # Futuristic Color Palette (Matching Reference Image 2)
    SUIT_WHITE = (244, 246, 250, 255)
    SUIT_SHADOW = (212, 218, 228, 255)
    CYAN_GLOW = (0, 229, 255, 255)         # Cyber neon cyan
    CYAN_GLOW_SOFT = (56, 189, 248, 190)   # Subtle cyan glow
    CYAN_DARK = (14, 116, 144, 255)
    CYBER_NAVY = (16, 24, 46, 255)         # Inner high-neck cyber top
    CYBER_NAVY_DEEP = (10, 16, 32, 255)
    GOLD_ACCENT = (218, 180, 60, 255)
    GOLD_LIGHT = (255, 230, 130, 255)

    # ─────────────────────────────────────────────────────────────────
    # 1. PURE WHITE TAILORED SUIT FABRIC ACROSS ENTIRE BLAZER
    # ─────────────────────────────────────────────────────────────────
    orig_pixels = im.load()
    overlay_pixels = overlay.load()

    base_r, base_g, base_b = 242, 245, 250

    for y in range(h):
        for x in range(w):
            r, g, b, a = orig_pixels[x, y]
            if a > 40:
                lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
                shade = (lum - 0.35) * 8.0
                nr = max(220, min(255, int(base_r + shade)))
                ng = max(224, min(255, int(base_g + shade)))
                nb = max(230, min(255, int(base_b + shade * 0.9)))

                # Subtle fine tech twill weave
                weave = ((x * 13 + y * 29) % 3) - 1
                nr = max(0, min(255, nr + weave))
                ng = max(0, min(255, ng + weave))
                nb = max(0, min(255, nb + weave))
                overlay_pixels[x, y] = (nr, ng, nb, 255)

    # ─────────────────────────────────────────────────────────────────
    # 2. INNER DARK CYBER HIGH-NECK COLLAR TOP WITH GLOWING CYAN PIPING
    # ─────────────────────────────────────────────────────────────────
    # Centerline is at X = 791, Y from 100 down to 270
    neck_pts = [
        (750, 100),
        (832, 100),
        (826, 165),
        (798, 272),
        (784, 272),
        (756, 165),
    ]
    draw.polygon(neck_pts, fill=CYBER_NAVY)

    # Subtle high-tech neck ribbing
    for ny in range(112, 175, 14):
        draw.line([(760, ny), (822, ny)], fill=(24, 38, 70, 255), width=2)

    # High-neck glowing cyan seam lines framing the neck
    draw.line([(750, 100), (786, 190)], fill=CYAN_GLOW, width=3)
    draw.line([(832, 100), (796, 190)], fill=CYAN_GLOW, width=3)
    draw.line([(791, 190), (791, 272)], fill=CYAN_GLOW_SOFT, width=2)

    # ─────────────────────────────────────────────────────────────────
    # 3. TAILORED WHITE NOTCH LAPELS WITH SUBTLE GLOWING CYAN EDGE LINES
    # ─────────────────────────────────────────────────────────────────
    # Left Lapel (Viewer's left, X < 791)
    l_lapel = [
        (750, 100),
        (706, 138), # Notch outer
        (720, 155), # Notch inner step
        (700, 205), # Lapel peak
        (786, 314), # Center crossover
        (791, 272), # Neck base
        (756, 165),
    ]
    # Soft drop shadow under lapel
    shadow_lapel = [(p[0] - 3, p[1] + 3) for p in l_lapel]
    draw.polygon(shadow_lapel, fill=(180, 190, 205, 160))
    # Crisp white lapel
    draw.polygon(l_lapel, fill=(250, 252, 255, 255))

    # Subtle Glowing Cyan Piping along lapel edge
    draw.line([(750, 100), (706, 138), (720, 155), (700, 205), (786, 314)], fill=CYAN_GLOW, width=3)
    # Softer outer glow blur
    draw.line([(750, 100), (706, 138), (720, 155), (700, 205), (786, 314)], fill=CYAN_GLOW_SOFT, width=5)

    # Right Lapel (Viewer's right, X > 791)
    r_lapel = [
        (832, 100),
        (876, 138), # Notch outer
        (862, 155), # Notch inner step
        (882, 205), # Lapel peak
        (796, 314), # Center crossover
        (791, 272), # Neck base
        (826, 165),
    ]
    shadow_r = [(p[0] + 3, p[1] + 3) for p in r_lapel]
    draw.polygon(shadow_r, fill=(180, 190, 205, 160))
    draw.polygon(r_lapel, fill=(250, 252, 255, 255))

    # Subtle Glowing Cyan Piping along right lapel edge
    draw.line([(832, 100), (876, 138), (862, 155), (882, 205), (796, 314)], fill=CYAN_GLOW, width=3)
    draw.line([(832, 100), (876, 138), (862, 155), (882, 205), (796, 314)], fill=CYAN_GLOW_SOFT, width=5)

    # Subtle Cyan Accent Lines on Shoulder Seams (from image 2)
    # Left shoulder seam
    draw.line([(645, 125), (706, 138)], fill=CYAN_GLOW_SOFT, width=2)
    # Right shoulder seam
    draw.line([(935, 125), (876, 138)], fill=CYAN_GLOW_SOFT, width=2)

    # Center Front Seam
    draw.line([(791, 314), (791, 480)], fill=(200, 210, 225, 255), width=2)
    draw.line([(792, 314), (792, 480)], fill=CYAN_GLOW_SOFT, width=1)

    # ─────────────────────────────────────────────────────────────────
    # 4. CHROME / WHITE CERAMIC EXECUTIVE BUTTONS
    # ─────────────────────────────────────────────────────────────────
    button_y_positions = [335, 395, 455]
    for by in button_y_positions:
        draw.ellipse([783, by - 7, 799, by + 8], fill=(180, 192, 210, 200))
        draw.ellipse([784, by - 6, 798, by + 7], fill=(245, 248, 255, 255), outline=CYAN_DARK, width=1)
        draw.ellipse([786, by - 4, 796, by + 5], fill=CYAN_GLOW)
        draw.ellipse([788, by - 2, 794, by + 3], fill=(255, 255, 255, 255))

    # ─────────────────────────────────────────────────────────────────
    # 5. LUXURY EXECUTIVE "Baatology" CHEST EMBLEM & BADGE
    # ─────────────────────────────────────────────────────────────────
    bx0, by0 = 688, 238
    bx1, by1 = 775, 292

    # Welt pocket horizontal bar
    draw.polygon([(682, 226), (776, 222), (776, 234), (682, 238)], fill=(230, 236, 246, 255))
    draw.line([(682, 226), (776, 222)], fill=CYAN_GLOW, width=2)

    # Cyber pocket square (midnight navy & glowing cyan tip)
    draw.polygon([(714, 224), (728, 206), (742, 223)], fill=CYBER_NAVY)
    draw.polygon([(728, 223), (740, 210), (752, 222)], fill=CYAN_GLOW)

    # Badge plate: Midnight titanium backing
    draw.rounded_rectangle([bx0 + 2, by0 + 3, bx1 + 2, by1 + 3], radius=7, fill=(180, 190, 205, 180))
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=7, fill=(12, 18, 36, 255), outline=CYAN_GLOW, width=2)
    draw.rounded_rectangle([bx0 + 3, by0 + 3, bx1 - 3, by1 - 3], radius=5, outline=CYAN_GLOW_SOFT, width=1)

    # Typography: "Baatology" in bold cyber cyan & gold
    font_brand = ImageFont.truetype(font_bold, 15)
    font_tag = ImageFont.truetype(font_bold, 8)

    w_baat = draw.textlength("Baat", font=font_brand)
    w_ology = draw.textlength("ology", font=font_brand)
    total_w = w_baat + w_ology
    text_x = bx0 + (bx1 - bx0 - total_w) // 2
    text_y = by0 + 7

    draw.text((text_x + 1, text_y + 1), "Baatology", font=font_brand, fill=(0, 0, 0, 240))
    draw.text((text_x, text_y), "Baat", font=font_brand, fill=CYAN_GLOW)
    draw.text((text_x + w_baat, text_y), "ology", font=font_brand, fill=GOLD_LIGHT)

    # Subtitle: "AI INTERVIEW" in polished white
    sub_text = "AI INTERVIEW"
    w_sub = draw.textlength(sub_text, font=font_tag)
    sub_x = bx0 + (bx1 - bx0 - w_sub) // 2
    sub_y = text_y + 20
    draw.text((sub_x, sub_y), sub_text, font=font_tag, fill=(240, 246, 255, 255))

    # Opposite lapel cyan cyber emblem pin
    draw.ellipse([870, 180, 882, 192], fill=(12, 18, 36, 255), outline=CYAN_GLOW, width=1)
    draw.ellipse([873, 183, 879, 189], fill=CYAN_GLOW)

    # ─────────────────────────────────────────────────────────────────
    # 6. SLEEVE CUFFS WITH GLOWING CYAN ACCENT RINGS
    # ─────────────────────────────────────────────────────────────────
    cuff_y = 815
    for cx in [435, 455, 475]:
        draw.ellipse([cx - 5, cuff_y - 5, cx + 5, cuff_y + 5], fill=CYAN_GLOW, outline=CYAN_DARK, width=1)
        draw.ellipse([cx - 2, cuff_y - 2, cx + 2, cuff_y + 2], fill=(255, 255, 255, 255))

    # Glowing cyan cuff line
    draw.line([(380, cuff_y - 12), (510, cuff_y - 12)], fill=CYAN_GLOW_SOFT, width=2)

    # Composite overlay onto base texture
    final_im = Image.alpha_composite(im, overlay)
    final_rgb = final_im.convert('RGB')
    final_rgb.save(out_path, 'PNG')
    final_rgb.save('public/models/white_cyber_blazer.png', 'PNG')
    print('Successfully generated futuristic white cyber blazer texture with Baatology badge:', out_path, 'and public/models/white_cyber_blazer.png')

if __name__ == '__main__':
    create_futuristic_white_blazer_texture()
