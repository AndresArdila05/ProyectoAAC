import math

class DynamicArray2:
    def __init__(self, capacity=2):
        self.capacity = capacity
        self.size = 0
        self.data = [None] * capacity

    def __len__(self):
        return self.size

    def push(self, value):
        if self.size == self.capacity:
            self._resize()
        self.data[self.size] = value
        self.size += 1

    def pop(self):
        if self.size == 0:
            raise IndexError("Pop from empty DynamicArray")
        value = self.data[self.size - 1]
        self.data[self.size - 1] = None
        self.size -= 1
        return value

    def _resize(self):
        self.capacity *= 2
        new_data = [None] * self.capacity
        for i in range(self.size):
            new_data[i] = self.data[i]
        self.data = new_data

    def insert(self, index, value):
        if self.size == self.capacity:
            self._resize()
        for i in range(self.size, index, -1):
            self.data[i] = self.data[i - 1]
        self.data[index] = value
        self.size += 1

    def get(self, index):
        if -self.size <= index < self.size:
            return self.data[index % self.size]
        raise IndexError("Index out of bounds")

    def set(self, index, value):
        if -self.size <= index < self.size:
            self.data[index % self.size] = value
        else:
            raise IndexError("Index out of bounds")

    def __getitem__(self, index):
        if isinstance(index, slice):
            result = DynamicArray2()
            for i in range(*index.indices(self.size)):
                result.push(self.data[i])
            return result
        else:
            return self.get(index)

    def __setitem__(self, index, value):
        self.set(index, value)

    def __repr__(self):
        return f"[{', '.join(str(self.data[i]) for i in range(self.size))}]"


def eliminar_ceros_finales(arreglo):
    while len(arreglo) > 1 and arreglo.get(-1) == 0:
        arreglo.pop()
    return arreglo


def compare_arrays(a, b):
    max_len = max(len(a), len(b))
    while len(a) < max_len:
        a.push(0)
    while len(b) < max_len:
        b.push(0)
    for i in range(max_len - 1, -1, -1):
        if a.get(i) > b.get(i):
            return 1
        elif a.get(i) < b.get(i):
            return -1
    return 0


def multi_unico_digito(q, a, base):
    resultado = DynamicArray2()
    carry = 0
    for i in range(len(a)):
        prod = a.get(i) * q + carry
        resultado.push(prod % base)
        carry = prod // base
    if carry > 0:
        resultado.push(carry)
    return resultado


def suma_digitos_base_b(a, b, base):
    resultado = DynamicArray2()
    carry = 0
    for i in range(max(len(a), len(b))):
        d1 = a.get(i) if i < len(a) else 0
        d2 = b.get(i) if i < len(b) else 0
        total = d1 + d2 + carry
        resultado.push(total % base)
        carry = total // base
    if carry:
        resultado.push(carry)
    return resultado


def resta_digitos_base_b(a, b, base):
    resultado = DynamicArray2()
    borrow = 0
    for i in range(len(a)):
        d1 = a.get(i)
        d2 = b.get(i) if i < len(b) else 0
        resta = d1 - d2 - borrow
        if resta < 0:
            resta += base
            borrow = 1
        else:
            borrow = 0
        resultado.push(resta)
    return eliminar_ceros_finales(resultado)


def extender_con_ceros(arr, cantidad):
    for _ in range(cantidad):
        arr.push(0)


def decimal_a_base_b(numero, base):
    if numero == 0:
        resultado = DynamicArray2()
        resultado.push(0)
        return resultado
    digitos = DynamicArray2()
    while numero > 0:
        digitos.push(numero % base)
        numero //= base
    return digitos


def base_b_a_decimal(digitos, base):
    valor = 0
    for i in range(len(digitos) - 1, -1, -1):
        valor = valor * base + digitos.get(i)
    return valor


def division_digitos_base_b(u_decimal, v_decimal, base):
    if v_decimal == 0:
        raise ValueError("División entre cero no permitida.")

    resultado = {
        "entrada": {
            "u_decimal": u_decimal,
            "v_decimal": v_decimal,
            "base": base
        },
        "preprocesamiento": {},
        "pasos": [],
        "resultado": {}
    }

    u = decimal_a_base_b(u_decimal, base)
    v = decimal_a_base_b(v_decimal, base)

    resultado["preprocesamiento"]["u_base_b"] = [u.get(i) for i in range(len(u))]
    resultado["preprocesamiento"]["v_base_b"] = [v.get(i) for i in range(len(v))]

    if u_decimal < v_decimal:
        coc = DynamicArray2(); coc.push(0)
        res = u
        resultado["resultado"] = {
            "cociente": [0],
            "residuo": [res.get(i) for i in range(len(res))],
            "cociente_decimal": 0,
            "residuo_decimal": u_decimal,
            "cociente_str_base_b": "0",
            "residuo_str_base_b": ''.join(str(res.get(i)) for i in reversed(range(len(res))))
        }
        return resultado

    n = len(v)
    m = len(u) - n
    d = base // (v.get(-1) + 1)

    resultado["preprocesamiento"]["factor_escala_d"] = d

    u_norm = multi_unico_digito(d, u, base)
    v_norm = multi_unico_digito(d, v, base)
    u_norm.push(0)

    resultado["preprocesamiento"]["u_normalizado"] = [u_norm.get(i) for i in range(len(u_norm))]
    resultado["preprocesamiento"]["v_normalizado"] = [v_norm.get(i) for i in range(len(v_norm))]

    q = DynamicArray2()

    for j in range(m, -1, -1):
        paso = {"j": j}

        u_tilde = u_norm[j:j + n + 1]
        while len(u_tilde) < n + 1:
            u_tilde.push(0)

        paso["u_tilde"] = [u_tilde.get(i) for i in range(len(u_tilde))]

        u_hi = u_tilde.get(-1)
        u_lo = u_tilde.get(-2) if n >= 1 else 0
        v_hi = v_norm.get(-1)

        q_i = (u_hi * base + u_lo) // v_hi
        q_i = min(q_i, base - 1)
        paso["q_i_estimado"] = q_i

        ajustes = []
        while True:
            producto = multi_unico_digito(q_i, v_norm, base)
            extender_con_ceros(producto, len(u_tilde) - len(producto))
            cmp = compare_arrays(producto, u_tilde)

            ajustes.append({
                "q_i": q_i,
                "producto": [producto.get(i) for i in range(len(producto))],
                "comparacion": cmp
            })

            if cmp <= 0:
                break
            q_i -= 1

        paso["ajustes"] = ajustes
        paso["producto_final"] = ajustes[-1]["producto"]
        q.insert(0, q_i)

        resto = resta_digitos_base_b(u_tilde, producto, base)
        paso["resto_parcial"] = [resto.get(i) for i in range(len(resto))]

        for k in range(len(resto)):
            u_norm[j + k] = resto.get(k)
        for k in range(len(resto), n + 1):
            u_norm[j + k] = 0

        paso["u_norm_actual"] = [u_norm.get(i) for i in range(len(u_norm))]
        resultado["pasos"].append(paso)

    # Final
    r_norm = u_norm[:n]
    r = base_b_a_decimal(r_norm, base)
    r_final = decimal_a_base_b(r // d, base)

    coc_decimal = base_b_a_decimal(q, base)
    res_decimal = base_b_a_decimal(r_final, base)

    coc_str = ''.join(str(q.get(i)) for i in reversed(range(len(q))))
    res_str = ''.join(str(r_final.get(i)) for i in reversed(range(len(r_final))))

    resultado["resultado"] = {
        "cociente": [q.get(i) for i in range(len(q))],
        "residuo": [r_final.get(i) for i in range(len(r_final))],
        "cociente_decimal": coc_decimal,
        "residuo_decimal": res_decimal,
        "cociente_str_base_b": coc_str,
        "residuo_str_base_b": res_str
    }

    return resultado


