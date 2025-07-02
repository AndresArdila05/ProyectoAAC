from core.dynamic_array import DynamicArray


def eliminar_ceros_finales(arr):
    while len(arr) > 1 and arr.get(len(arr) - 1) == 0:
        arr.pop()
    return arr


def compare_arrays(a, b):
    max_len = max(len(a), len(b))
    for _ in range(max_len - len(a)):
        a.push(0)
    for _ in range(max_len - len(b)):
        b.push(0)
    for i in range(max_len - 1, -1, -1):
        if a.get(i) > b.get(i):
            return 1
        elif a.get(i) < b.get(i):
            return -1
    return 0


def multi_unico_digito(q, a, base):
    resultado = DynamicArray()
    carry = 0
    for i in range(len(a)):
        prod = a.get(i) * q + carry
        resultado.push(prod % base)
        carry = prod // base
    if carry:
        resultado.push(carry)
    return resultado


def resta_digitos_base_b(a, b, base):
    resultado = DynamicArray()
    borrow = 0
    for i in range(len(a)):
        d1 = a.get(i)
        d2 = b.get(i) if i < len(b) else 0
        r = d1 - d2 - borrow
        if r < 0:
            r += base
            borrow = 1
        else:
            borrow = 0
        resultado.push(r)
    return eliminar_ceros_finales(resultado)


def decimal_a_base_b(n, base):
    if n == 0:
        arr = DynamicArray()
        arr.push(0)
        return arr
    arr = DynamicArray()
    while n > 0:
        arr.push(n % base)
        n //= base
    return arr


def base_b_a_decimal(arr, base):
    total = 0
    for i in range(len(arr) - 1, -1, -1):
        total = total * base + arr.get(i)
    return total


def list_from_array(arr):
    return [arr.get(i) for i in range(len(arr))]


def division_digitos_base_b(u_decimal, v_decimal, base):
    if v_decimal == 0:
        raise ValueError("División entre cero no permitida.")
    
    u_arr = decimal_a_base_b(u_decimal, base)
    v_arr = decimal_a_base_b(v_decimal, base)

    if u_decimal < v_decimal:
        return {
            "q": [0],
            "r": list_from_array(u_arr),
            "base": base,
            "u_string": "".join(str(d) for d in reversed(list_from_array(u_arr))),
            "v_string": "".join(str(d) for d in reversed(list_from_array(v_arr))),
            "u_digits": list_from_array(u_arr),
            "v_digits": list_from_array(v_arr),
            "result_string": "0",
            "result_decimal": 0,
            "steps": []
        }

    n = len(v_arr)
    m = len(u_arr) - n

    d = base // (v_arr.get(n - 1) + 1)
    u_norm = multi_unico_digito(d, u_arr, base)
    v_norm = multi_unico_digito(d, v_arr, base)
    u_norm.push(0)

    q = DynamicArray()
    steps = []

    for j in range(m, -1, -1):
        u_tilde = DynamicArray()
        for i in range(j, j + n + 1):
            u_tilde.push(u_norm.get(i) if i < len(u_norm) else 0)

        u_hi = u_tilde.get(n)
        u_lo = u_tilde.get(n - 1)
        v_hi = v_norm.get(n - 1)

        q_hat = (u_hi * base + u_lo) // v_hi
        q_hat = min(q_hat, base - 1)

        producto = multi_unico_digito(q_hat, v_norm, base)
        while len(producto) < len(u_tilde):
            producto.push(0)

        ajustes = []
        while compare_arrays(producto, u_tilde) == 1:
            ajustes.append({
                "q_hat": q_hat,
                "producto": list_from_array(producto),
                "comparado_con": list_from_array(u_tilde)
            })
            q_hat -= 1
            producto = multi_unico_digito(q_hat, v_norm, base)
            while len(producto) < len(u_tilde):
                producto.push(0)

        q.push(q_hat)
        resta = resta_digitos_base_b(u_tilde, producto, base)

        for k in range(len(resta)):
            u_norm.set(j + k, resta.get(k))
        for k in range(len(resta), n + 1):
            u_norm.set(j + k, 0)

        steps.append({
            "j": j,
            "u_tilde": list_from_array(u_tilde),
            "q_hat": q_hat,
            "producto": list_from_array(producto),
            "resto": list_from_array(resta),
            "ajustes": ajustes,
            "Resumen": f"Se estimó q[{j}] = {q_hat + len(ajustes)}, ajustado a {q_hat} luego de {len(ajustes)} correcciones."
        })

    r_norm = DynamicArray()
    for i in range(n):
        r_norm.push(u_norm.get(i))
    r_decimal = base_b_a_decimal(r_norm, base)
    r_final = decimal_a_base_b(r_decimal // d, base)

    q_final = eliminar_ceros_finales(q)
    r_final = eliminar_ceros_finales(r_final)

    return {
        "q": list_from_array(q_final),
        "r": list_from_array(r_final),
        "base": base,
        "u_string": "".join(str(d) for d in reversed(list_from_array(u_arr))),
        "v_string": "".join(str(d) for d in reversed(list_from_array(v_arr))),
        "u_digits": list_from_array(u_arr),
        "v_digits": list_from_array(v_arr),
        "result_string": "".join(str(d) for d in reversed(list_from_array(q_final))),
        "result_decimal": base_b_a_decimal(q_final, base),
        "steps": steps
    }
