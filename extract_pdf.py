import sys
try:
    import fitz
    doc = fitz.open(sys.argv[1])
    text = ''
    for page in doc:
        text += page.get_text()
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        f.write(text)
    print('Success fitz ' + sys.argv[1])
except ImportError:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(sys.argv[1])
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        with open(sys.argv[2], 'w', encoding='utf-8') as f:
            f.write(text)
        print('Success PyPDF2 ' + sys.argv[1])
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'PyPDF2'])
        import PyPDF2
        reader = PyPDF2.PdfReader(sys.argv[1])
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        with open(sys.argv[2], 'w', encoding='utf-8') as f:
            f.write(text)
        print('Success PyPDF2 after install ' + sys.argv[1])
