"""
Approximate latitude/longitude mappings for Malaysian districts.
Coordinates are approximate centre points — replace with authoritative
GIS data for production use.
"""

DISTRICT_COORDINATES: dict[str, dict[str, float]] = {
    # ── Johor ──────────────────────────────────────────────
    "batu pahat":            {"lat": 1.8494, "lon": 102.9288},
    "iskandar puteri":       {"lat": 1.4220, "lon": 103.6500},
    "johor bahru selatan":   {"lat": 1.4927, "lon": 103.7414},
    "johor bahru utara":     {"lat": 1.5430, "lon": 103.7100},
    "kluang":                {"lat": 2.0300, "lon": 103.3180},
    "kota tinggi":           {"lat": 1.7380, "lon": 103.9000},
    "kulaijaya":             {"lat": 1.6460, "lon": 103.6000},
    "ledang":                {"lat": 2.1800, "lon": 102.5700},
    "mersing":               {"lat": 2.4300, "lon": 103.8400},
    "muar":                  {"lat": 2.0440, "lon": 102.5690},
    "nusajaya":              {"lat": 1.4200, "lon": 103.6500},
    "pontian":               {"lat": 1.4870, "lon": 103.3900},
    "segamat":               {"lat": 2.5140, "lon": 102.8160},
    "seri alam":             {"lat": 1.5100, "lon": 103.8700},

    # ── Kedah ──────────────────────────────────────────────
    "baling":                {"lat": 5.6800, "lon": 100.9100},
    "bandar baharu":         {"lat": 5.1300, "lon": 100.4900},
    "kota setar":            {"lat": 6.1100, "lon": 100.3700},
    "kuala muda":            {"lat": 5.5900, "lon": 100.3900},
    "kubang pasu":           {"lat": 6.3500, "lon": 100.3300},
    "kulim":                 {"lat": 5.3600, "lon": 100.5500},
    "langkawi":              {"lat": 6.3500, "lon": 99.8000},
    "padang terap":          {"lat": 6.2500, "lon": 100.5500},
    "pendang":               {"lat": 5.9900, "lon": 100.4800},
    "sik":                   {"lat": 5.8200, "lon": 100.7400},
    "yan":                   {"lat": 5.7800, "lon": 100.3700},

    # ── Kelantan ───────────────────────────────────────────
    "bachok":                {"lat": 6.0600, "lon": 102.4000},
    "gua musang":            {"lat": 4.8700, "lon": 101.9600},
    "jeli":                  {"lat": 5.7000, "lon": 101.8400},
    "kota bharu":            {"lat": 6.1300, "lon": 102.2400},
    "kuala krai":            {"lat": 5.5300, "lon": 102.2000},
    "machang":               {"lat": 5.7600, "lon": 102.2200},
    "pasir mas":             {"lat": 6.0400, "lon": 102.1400},
    "pasir puteh":           {"lat": 5.8400, "lon": 102.4100},
    "tanah merah":           {"lat": 5.8100, "lon": 102.1500},
    "tumpat":                {"lat": 6.2000, "lon": 102.1700},

    # ── Melaka ─────────────────────────────────────────────
    "alor gajah":            {"lat": 2.3800, "lon": 102.2100},
    "jasin":                 {"lat": 2.3100, "lon": 102.4300},
    "melaka tengah":         {"lat": 2.2000, "lon": 102.2500},

    # ── Negeri Sembilan ────────────────────────────────────
    "jelebu":                {"lat": 2.9400, "lon": 102.0300},
    "jempol":                {"lat": 2.8600, "lon": 102.4200},
    "kuala pilah":           {"lat": 2.7400, "lon": 102.2500},
    "nilai":                 {"lat": 2.8200, "lon": 101.8000},
    "port dickson":          {"lat": 2.5200, "lon": 101.7900},
    "rembau":                {"lat": 2.5900, "lon": 102.1000},
    "seremban":              {"lat": 2.7300, "lon": 101.9400},
    "tampin":                {"lat": 2.4700, "lon": 102.2300},

    # ── Pahang ─────────────────────────────────────────────
    "bentong":               {"lat": 3.5200, "lon": 101.9100},
    "bera":                  {"lat": 3.2600, "lon": 102.4500},
    "cameron highland":      {"lat": 4.4800, "lon": 101.3800},
    "cameron highlands":     {"lat": 4.4800, "lon": 101.3800},
    "jerantut":              {"lat": 3.9400, "lon": 102.3600},
    "kuantan":               {"lat": 3.8200, "lon": 103.3300},
    "kuala lipis":           {"lat": 4.1800, "lon": 102.0500},
    "maran":                 {"lat": 3.5800, "lon": 102.7800},
    "pekan":                 {"lat": 3.5000, "lon": 103.4200},
    "raub":                  {"lat": 3.7900, "lon": 101.8600},
    "rompin":                {"lat": 2.8100, "lon": 103.4800},
    "temerloh":              {"lat": 3.4500, "lon": 102.4200},

    # ── Perak ──────────────────────────────────────────────
    "batu gajah":            {"lat": 4.4700, "lon": 101.0400},
    "gerik":                 {"lat": 5.4300, "lon": 101.1300},
    "hilir perak":           {"lat": 3.9600, "lon": 100.9300},
    "ipoh":                  {"lat": 4.6000, "lon": 101.0700},
    "kampar":                {"lat": 4.3100, "lon": 101.1500},
    "kerian":                {"lat": 5.0100, "lon": 100.5000},
    "kuala kangsar":         {"lat": 4.7700, "lon": 100.9400},
    "manjung":               {"lat": 4.2100, "lon": 100.6600},
    "pengkalan hulu":        {"lat": 5.7000, "lon": 101.0000},
    "perak tengah":          {"lat": 4.3200, "lon": 100.9100},
    "selama":                {"lat": 5.0900, "lon": 100.7000},
    "sungai siput":          {"lat": 4.8200, "lon": 101.0700},
    "taiping":               {"lat": 4.8500, "lon": 100.7400},
    "tanjong malim":         {"lat": 3.6800, "lon": 101.5200},
    "tapah":                 {"lat": 4.2000, "lon": 101.2600},

    # ── Perlis ─────────────────────────────────────────────
    "arau":                  {"lat": 6.4300, "lon": 100.2700},
    "kangar":                {"lat": 6.4400, "lon": 100.2000},
    "padang besar":          {"lat": 6.6600, "lon": 100.3200},

    # ── Pulau Pinang ───────────────────────────────────────
    "barat daya":            {"lat": 5.3200, "lon": 100.2300},
    "seberang perai selatan": {"lat": 5.2500, "lon": 100.4700},
    "seberang perai tengah":  {"lat": 5.3700, "lon": 100.4500},
    "seberang perai utara":   {"lat": 5.4400, "lon": 100.4100},
    "timur laut":            {"lat": 5.4200, "lon": 100.3300},

    # ── Sabah ──────────────────────────────────────────────
    "beaufort":              {"lat": 5.3400, "lon": 115.7500},
    "beluran":               {"lat": 6.1000, "lon": 117.3000},
    "keningau":              {"lat": 5.3400, "lon": 116.1600},
    "kota belud":            {"lat": 6.3500, "lon": 116.4300},
    "kota kinabalu":         {"lat": 5.9800, "lon": 116.0700},
    "kota kinabatangan":     {"lat": 5.7000, "lon": 117.6000},
    "kota marudu":           {"lat": 6.4900, "lon": 116.7400},
    "kudat":                 {"lat": 6.8800, "lon": 116.8400},
    "kunak":                 {"lat": 4.6800, "lon": 118.2500},
    "lahad datu":            {"lat": 5.0300, "lon": 118.3400},
    "papar":                 {"lat": 5.7300, "lon": 115.9300},
    "penampang":             {"lat": 5.9100, "lon": 116.1000},
    "ranau":                 {"lat": 5.9600, "lon": 116.6700},
    "sandakan":              {"lat": 5.8400, "lon": 118.1200},
    "semporna":              {"lat": 4.4800, "lon": 118.6100},
    "sipitang":              {"lat": 5.0800, "lon": 115.5500},
    "tawau":                 {"lat": 4.2600, "lon": 117.8900},
    "tenom":                 {"lat": 5.1300, "lon": 115.9500},
    "tuaran":                {"lat": 6.1800, "lon": 116.2300},

    # ── Sarawak ────────────────────────────────────────────
    "bau":                   {"lat": 1.4200, "lon": 110.1600},
    "belaga":                {"lat": 2.7000, "lon": 113.7800},
    "betong":                {"lat": 1.5100, "lon": 111.5300},
    "bintulu":               {"lat": 3.1700, "lon": 113.0300},
    "dalat":                 {"lat": 2.7400, "lon": 111.9300},
    "julau":                 {"lat": 2.0200, "lon": 111.9100},
    "kanowit":               {"lat": 2.0900, "lon": 112.1500},
    "kapit":                 {"lat": 2.0200, "lon": 112.9400},
    "kota samarahan":        {"lat": 1.4600, "lon": 110.5000},
    "kuching":               {"lat": 1.5500, "lon": 110.3400},
    "lawas":                 {"lat": 4.8600, "lon": 115.4100},
    "limbang":               {"lat": 4.7500, "lon": 115.0100},
    "lubok antu":            {"lat": 1.0400, "lon": 111.8300},
    "lundu":                 {"lat": 1.6800, "lon": 109.8500},
    "marudi":                {"lat": 4.1800, "lon": 114.3200},
    "matu daro":             {"lat": 2.6900, "lon": 111.5400},
    "meradong":              {"lat": 2.2300, "lon": 111.6100},
    "miri":                  {"lat": 4.4000, "lon": 113.9900},
    "mukah":                 {"lat": 2.9000, "lon": 112.0900},
    "padawan":               {"lat": 1.3900, "lon": 110.2600},
    "saratok":               {"lat": 1.7400, "lon": 111.3400},
    "sarikei":               {"lat": 2.1300, "lon": 111.5200},
    "serian":                {"lat": 1.1700, "lon": 110.5700},
    "sibu":                  {"lat": 2.2900, "lon": 111.8300},
    "simunjan":              {"lat": 1.4000, "lon": 110.7500},
    "song":                  {"lat": 2.0100, "lon": 112.5500},
    "sri aman":              {"lat": 1.2400, "lon": 111.4600},
    "tatau":                 {"lat": 2.8800, "lon": 112.8500},

    # ── Selangor ───────────────────────────────────────────
    "ampang jaya":           {"lat": 3.1500, "lon": 101.7700},
    "cheras":                {"lat": 3.0700, "lon": 101.7500},
    "gombak":                {"lat": 3.3000, "lon": 101.7200},
    "hulu selangor":         {"lat": 3.5700, "lon": 101.6300},
    "kajang":                {"lat": 2.9900, "lon": 101.7900},
    "klang selatan":         {"lat": 3.0100, "lon": 101.4500},
    "klang utara":           {"lat": 3.0700, "lon": 101.4200},
    "kuala langat":          {"lat": 2.8100, "lon": 101.4800},
    "kuala selangor":        {"lat": 3.3400, "lon": 101.2500},
    "petaling jaya":         {"lat": 3.1000, "lon": 101.6400},
    "sabak bernam":          {"lat": 3.7700, "lon": 100.9900},
    "sepang":                {"lat": 2.7500, "lon": 101.7200},
    "serdang":               {"lat": 3.0000, "lon": 101.7200},
    "shah alam":             {"lat": 3.0700, "lon": 101.5200},
    "sg. buloh":             {"lat": 3.2000, "lon": 101.5700},
    "subang jaya":           {"lat": 3.0500, "lon": 101.5900},
    "sungai buloh":          {"lat": 3.2000, "lon": 101.5700},

    # ── Terengganu ─────────────────────────────────────────
    "besut":                 {"lat": 5.8300, "lon": 102.5600},
    "dungun":                {"lat": 4.7600, "lon": 103.4200},
    "hulu terengganu":       {"lat": 5.0800, "lon": 102.7800},
    "kemaman":               {"lat": 4.2300, "lon": 103.4200},
    "kuala terengganu":      {"lat": 5.3300, "lon": 103.1400},
    "marang":                {"lat": 5.2000, "lon": 103.0800},
    "setiu":                 {"lat": 5.4600, "lon": 102.8500},

    # ── W.P. Kuala Lumpur ──────────────────────────────────
    "bandar bharu":          {"lat": 3.1400, "lon": 101.7000},
    "brickfields":           {"lat": 3.1300, "lon": 101.6900},
    "dang wangi":            {"lat": 3.1500, "lon": 101.7000},
    "sentul":                {"lat": 3.1900, "lon": 101.7000},
    "wangsa maju":           {"lat": 3.2000, "lon": 101.7400},

    # ── W.P. Labuan ────────────────────────────────────────
    "w.p. labuan":           {"lat": 5.2800, "lon": 115.2400},

    # ── W.P. Putrajaya ─────────────────────────────────────
    "w.p. putrajaya":        {"lat": 2.9300, "lon": 101.6900},
}
