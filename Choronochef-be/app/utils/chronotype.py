def calculate_chronotype(answers: dict) -> str:
    """
    Logic đơn giản: 
    - Năng lượng buổi sáng cao + Thích ngủ sớm -> Lion
    - Năng lượng thấp sáng + Cao tối -> Wolf
    - Ngủ chập chờn / Khó ngủ -> Dolphin
    - Còn lại đa số là -> Bear
    """
    total_score = answers['morning_energy'] + answers['sleep_depth'] + answers['focus_time']
    
    if answers['sleep_depth'] == 1: # Ngủ rất nông
        return "Dolphin"
    elif answers['morning_energy'] == 4: # Rất tỉnh táo buổi sáng
        return "Lion"
    elif answers['morning_energy'] <= 2 and total_score < 7: # Cú đêm
        return "Wolf"
    else:
        return "Bear"