def evaluar(respuestas_usuario, preguntas):
    resultado = []
    
    for r in respuestas_usuario:
        pregunta = buscar_pregunta(r["id"])
        
        correcto = r["respuesta"] == pregunta["respuesta_correcta"]
        
        resultado.append({
            "id": r["id"],
            "correcto": correcto,
            "tema": pregunta["tema"],
            "subtema": pregunta["subtema"]
        })
        
        return resultado
        
        def detectar_fallas(estadisticas):
        debiles = []
        
        for tema, data in estadisticas.items():
            if data["incorrectas"] > data["correctas"]:
                debiles.append(tema)
                
                return debiles