package br.com.startquimica.backend.importacao;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public interface ArquivoParser {
    FormatoArquivo getFormato();
    List<LinhaArquivo> parse(InputStream input) throws IOException;
}
