package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.domain.LogEnvioCobranca;
import br.com.startquimica.backend.domain.Usuario;
import br.com.startquimica.backend.repository.LogEnvioCobrancaRepository;
import br.com.startquimica.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogEnvioCobrancaService {

    private final LogEnvioCobrancaRepository logRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Cobranca cobranca,
                          String payloadJson,
                          String urlDestino,
                          String origem,
                          Long usuarioId,
                          boolean sucesso,
                          String protocolo,
                          String codigoErro,
                          String mensagemErro,
                          String respostaRecebida,
                          long tempoRespostaMs) {

        LogEnvioCobranca logEnvio = new LogEnvioCobranca();
        logEnvio.setCobranca(cobranca);
        logEnvio.setTenantId(cobranca.getTenantId());
        logEnvio.setDataTentativa(LocalDateTime.now());
        logEnvio.setSucesso(sucesso);
        logEnvio.setProtocoloSankhya(protocolo);
        logEnvio.setCodigoErro(codigoErro);
        logEnvio.setMensagemErro(mensagemErro);
        logEnvio.setPayloadEnviado(payloadJson);
        logEnvio.setRespostaRecebida(respostaRecebida);
        logEnvio.setUrlDestino(urlDestino);
        logEnvio.setOrigem(origem);
        logEnvio.setTempoRespostaMs(tempoRespostaMs);

        if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            logEnvio.setUsuario(usuario);
        }

        String hash = logEnvio.calcularHash();
        logEnvio.setHashRegistro(hash);

        Optional<LogEnvioCobranca> existente =
                logRepository.findByCobrancaIdAndHashRegistro(cobranca.getId(), hash);

        if (existente.isPresent()) {
            LogEnvioCobranca reg = existente.get();
            reg.setDataTentativa(logEnvio.getDataTentativa());
            reg.setTempoRespostaMs(tempoRespostaMs);
            logRepository.save(reg);
            log.debug("Log de envio atualizado (hash duplicado) para cobrança {}", cobranca.getId());
        } else {
            logRepository.save(logEnvio);
            log.debug("Novo log de envio registrado para cobrança {}", cobranca.getId());
        }
    }

    public Page<LogEnvioCobranca> findByCobrancaId(Long cobrancaId, Pageable pageable) {
        return logRepository.findByCobrancaId(cobrancaId, pageable);
    }
}
