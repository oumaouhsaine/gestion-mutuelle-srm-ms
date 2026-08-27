package com.mutuelle.mutuelle_backend.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.mutuelle.mutuelle_backend.model.*;
import com.mutuelle.mutuelle_backend.repository.BeneficiaireRepository;
import com.mutuelle.mutuelle_backend.repository.EtablissementRepository;
import com.mutuelle.mutuelle_backend.repository.AgentRepository;
import com.mutuelle.mutuelle_backend.repository.UserRepository;
import com.mutuelle.mutuelle_backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfService {

    @Autowired private BeneficiaireRepository beneficiaireRepository;
    @Autowired private EtablissementRepository etablissementRepository;
    @Autowired private AgentRepository agentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceRepository serviceRepository;

    public byte[] generatePecPdf(PriseEnCharge pec) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String createdByName = "SRM-MS"; // default fallback
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                Agent currentAgent = agentRepository.findByMatricule(username).orElse(null);
                if (currentAgent != null && currentAgent.getIdUser() != null) {
                    user = userRepository.findById(currentAgent.getIdUser()).orElse(null);
                }
            }
            if (user != null) {
                String fullName = (user.getPrenom() != null ? user.getPrenom() : "") + " " + (user.getNom() != null ? user.getNom() : "");
                fullName = fullName.trim();
                if (!fullName.isEmpty()) {
                    createdByName = fullName;
                } else {
                    createdByName = user.getUsername();
                }
            } else {
                Agent currentAgent = agentRepository.findByMatricule(username).orElse(null);
                if (currentAgent != null) {
                    createdByName = currentAgent.getNomComplet();
                } else {
                    createdByName = username;
                }
            }
        }

        Beneficiaire bene = beneficiaireRepository.findById(pec.getIdBeneficiaire()).orElse(null);
        Agent agent = (bene != null && bene.getIdAgent() != null) ? agentRepository.findById(bene.getIdAgent()).orElse(null) : null;
        Etablissement etab = pec.getIdEtablissement() != null ? etablissementRepository.findById(pec.getIdEtablissement()).orElse(null) : null;
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33})).useAllAvailableWidth();
        headerTable.addCell(new Cell().add(new Paragraph("SECURITE SOCIALE").setBold().setTextAlignment(TextAlignment.CENTER)).add(new Paragraph("\n\nRéf: " + (pec.getIdPec() != null ? pec.getIdPec() : ""))));
        headerTable.addCell(new Cell().add(new Paragraph("PRISE EN CHARGE").setBold().setTextAlignment(TextAlignment.CENTER)).add(new Paragraph("\nFRAIS POUR SOIN DE SANTE").setBold().setTextAlignment(TextAlignment.CENTER)));
        headerTable.addCell(new Cell().add(new Paragraph("Clinique : " + (etab != null ? etab.getRaisonSociale() : ""))));
        document.add(headerTable);

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        infoTable.addCell(new Cell().add(new Paragraph("CETTE PRISE EN CHARGE COUVRE LES ACTES MEDICAUX, D'ANALYSES, DE RADIOLOGIES, DE PRODUITS PHARMACEUTIQUES, EXECUTES ET ORDONNES PAR LES RESPONSABLES MEDICAUX DE " + (etab != null ? etab.getRaisonSociale() : "la clinique") + " PENDANT ET APRES L'HOSPITALISATION DU MALADE").setBold().setFontSize(9).setTextAlignment(TextAlignment.CENTER)));
        document.add(infoTable);

        Table section11 = new Table(UnitValue.createPercentArray(new float[]{40, 60})).useAllAvailableWidth();
        section11.addCell(new Cell().add(new Paragraph("11/ NOM OU RAISON SOCIALE").setBold().setFontSize(9)));
        section11.addCell(new Cell());
        document.add(section11);

        Table section12Title = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        section12Title.addCell(new Cell().add(new Paragraph("12/ RENSEIGNEMENT CONCERNANT LE SALARIE ,LE CONJOINT OU UN ENFANT A CHARGE DU SALARIE").setBold().setFontSize(9).setTextAlignment(TextAlignment.CENTER)));
        document.add(section12Title);

        Table section12 = new Table(UnitValue.createPercentArray(new float[]{40, 40, 20})).useAllAvailableWidth();
        section12.addCell(new Cell().add(new Paragraph("121/ SOIN DE : " + (pec.getTypeSoin() != null ? pec.getTypeSoin() : "")).setFontSize(9).setBold()));
        section12.addCell(new Cell().add(new Paragraph("Nom : " + (agent != null ? agent.getNom() : "")).setFontSize(9)));
        section12.addCell(new Cell().add(new Paragraph("SEANCES  " + (pec.getNombreSeance() != null ? pec.getNombreSeance() : "0")).setFontSize(9).setBold()));
        section12.addCell(new Cell().add(new Paragraph("122/NOM ET PRENOM DU SALARIE").setFontSize(9).setBold()));
        section12.addCell(new Cell().add(new Paragraph("Prénom : " + (agent != null ? agent.getPrenom() : "")).setFontSize(9)));
        section12.addCell(new Cell().add(new Paragraph("Matricule: " + (agent != null ? agent.getMatricule() : "")).setFontSize(9)));
        section12.addCell(new Cell());
        section12.addCell(new Cell());
        section12.addCell(new Cell().add(new Paragraph("Régie:  SRM-MS").setFontSize(9).setBold()));
        document.add(section12);

        Table section125 = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        Cell c125 = new Cell().setHeight(40).add(new Paragraph("125/RECEVOIR LES SOINS").setFontSize(9).setBold()).add(new Paragraph("Relation : " + (bene != null ? bene.getLienParente() : "")).setFontSize(9).setTextAlignment(TextAlignment.CENTER));
        section125.addCell(c125);
        document.add(section125);

        boolean isAutreQueSalarie = bene != null && !"Lui-même".equalsIgnoreCase(bene.getLienParente()) && !"Lui-meme".equalsIgnoreCase(bene.getLienParente());
        Table section13 = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        section13.addCell(new Cell().add(new Paragraph("NOM ET PRENOM DU MALADE AUTRE QUE LE SALARIE").setBold().setFontSize(9)).add(new Paragraph("\n13/Les dossiers de demande de remboursement des frais de soins de santé auprès des organismes assurant une protection sanitaire seront joints à la factures établie par l'établissement et adressés ou remis à:").setFontSize(8)));
        section13.addCell(new Cell().add(new Paragraph("Nom : " + (isAutreQueSalarie ? bene.getNom() : "")).setFontSize(9)).add(new Paragraph("Prénom : " + (isAutreQueSalarie ? bene.getPrenom() : "")).setFontSize(9)).add(new Paragraph("\nPar cette prise en charge, le soussigné s'engage à régler le montant de la facture qui lui sera présentée par " + (etab != null ? etab.getRaisonSociale() : "l'établissement") + " dans les HUITS JOURS qui suivent sa réception.").setFontSize(8)).add(new Paragraph("\nFAIT à MARRAKECH : " + sdf.format(new Date())).setFontSize(9)).add(new Paragraph("Etablie par : " + createdByName).setFontSize(9)));
        document.add(section13);

        Table procurationTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
        procurationTable.addCell(new Cell().add(new Paragraph("Je soussigné:.............................................................................\n"
                + "donne procuration à.....................................................................\n"
                + "Pour présenter et encaisser en mon nom les sommes qui doivent\n"
                + "m'être remboursées\n"
                + "Par.........................................................................................\n"
                + "au titre des frais qui ont été engagé par..............................................\n"
                + "dans le cadre de cette prise en charge").setFontSize(8)));
        procurationTable.addCell(new Cell().add(new Paragraph("\n\nLE : " + sdf.format(new Date())).setFontSize(9).setTextAlignment(TextAlignment.CENTER)).add(new Paragraph("\nSIGNATURE DU SALARIE").setBold().setFontSize(10).setTextAlignment(TextAlignment.CENTER)).setHeight(100));
        document.add(procurationTable);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateBulletinAdhesion(CarteMutuelle carte) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        document.setMargins(30, 30, 30, 30);

        Beneficiaire bene = beneficiaireRepository.findById(carte.getIdBeneficiaire()).orElse(null);
        Agent agent = (bene != null && bene.getIdAgent() != null) ? agentRepository.findById(bene.getIdAgent()).orElse(null) : null;
        List<Beneficiaire> famille = (agent != null) ? beneficiaireRepository.findByIdAgent(agent.getIdAgent()) : List.of();
        
        Beneficiaire conjoint = famille.stream().filter(b -> "Conjoint".equalsIgnoreCase(b.getLienParente())).findFirst().orElse(null);
        List<Beneficiaire> enfants = famille.stream().filter(b -> "Enfant".equalsIgnoreCase(b.getLienParente())).collect(Collectors.toList());

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        // --- Logo and Header ---
        try {
            String logoPath = "c:\\Users\\Hp\\Desktop\\Radeema\\PROJET\\gestion-mutuelle-frontend\\public\\images\\logo.jpg";
            Image logo = new Image(ImageDataFactory.create(logoPath)).setWidth(60).setFixedPosition(30, 750);
            document.add(logo);
        } catch (Exception e) { /* Logo skip if not found */ }

        document.add(new Paragraph("CAISSE MUTUELLE DE SECURITE SOCIALE DU PERSONNEL DES REGIES\nAUTONOMES DES DISTRIBUTIONS D'EAU ET D'ELECTRICITE AU MAROC CMSS\nN°3, Rue Bouchaib Ferrad - CASABLANCA\nTél: 05 22 31 06 54")
                .setTextAlignment(TextAlignment.CENTER).setFontSize(9).setBold().setMarginTop(10));

        document.add(new Paragraph("\nBULLETIN D'ADHESION")
                .setTextAlignment(TextAlignment.CENTER).setFontSize(14).setBold().setUnderline().setMarginTop(20));

        // --- Agent Info ---
        String serviceName = "....................";
        if (agent != null && agent.getIdService() != null) {
            serviceName = serviceRepository.findById(agent.getIdService()).map(com.mutuelle.mutuelle_backend.model.Service::getNom).orElse("....................");
        }

        document.add(new Paragraph("\nJe soussigné, Nom : " + (agent != null && agent.getNom() != null ? agent.getNom() : "....................") 
                + "  Prénom de l'agent : " + (agent != null && agent.getPrenom() != null ? agent.getPrenom() : "...................."))
                .setFontSize(10).setMarginTop(10));
        
        document.add(new Paragraph("Matricule : " + (agent != null ? agent.getMatricule() : "..........") 
                + "   Service : " + serviceName + "   Exploitation : SRM-MS")
                .setFontSize(10));

        document.add(new Paragraph("Date et lieu de naissance : " + (agent != null && agent.getDateNaissance() != null ? sdf.format(agent.getDateNaissance()) : "....................") 
                + " à " + (agent != null && agent.getVille() != null ? agent.getVille() : "...................."))
                .setFontSize(10));

        document.add(new Paragraph("Situation de famille : " + (agent != null && agent.getSituationFamiliale() != null ? agent.getSituationFamiliale() : "....................") 
                + " Demeurant à : " + (agent != null && agent.getAdresse() != null ? agent.getAdresse() : "...................."))
                .setFontSize(10));

        document.add(new Paragraph("Contact : " + (agent != null ? (agent.getTelephone() != null ? agent.getTelephone() : "") + (agent.getEmail() != null ? " / " + agent.getEmail() : "") : "...................."))
                .setFontSize(10));

        document.add(new Paragraph("Date d'entrée à la Régie : " + (agent != null && agent.getDateEntreeRegie() != null ? sdf.format(agent.getDateEntreeRegie()) : "....................") 
                + " Date de titularisation : " + (agent != null && agent.getDateTitularisation() != null ? sdf.format(agent.getDateTitularisation()) : "...................."))
                .setFontSize(10));

        document.add(new Paragraph("Classement : ....................")
                .setFontSize(10));

        document.add(new Paragraph("Demande de : " + (carte.getTypeDemande() != null ? carte.getTypeDemande() : "Adhésion"))
                .setFontSize(10).setBold());

        document.add(new Paragraph("Raison de changement : " + (carte.getRaisonChangement() != null ? carte.getRaisonChangement() : "...................."))
                .setFontSize(10));

        // --- Ayants Droit ---
        document.add(new Paragraph("\nAYANTS DROIT").setBold().setUnderline().setFontSize(11));
        
        // Conjoint
        document.add(new Paragraph("1. CONJOINT :").setBold().setFontSize(10));
        document.add(new Paragraph("Nom Complet : " + (conjoint != null ? conjoint.getNom() + " " + conjoint.getPrenom() : "....................")).setFontSize(10));
        document.add(new Paragraph("Date et lieu de naissance : " + (conjoint != null && conjoint.getDateNaissance() != null ? sdf.format(conjoint.getDateNaissance()) : "....................") 
                + " à " + (conjoint != null && conjoint.getLieuNaissance() != null ? conjoint.getLieuNaissance() : "....................")).setFontSize(10));
        document.add(new Paragraph("Date de mariage : ....................").setFontSize(10));
        document.add(new Paragraph("Est-elle salariée ? (1)   OUI " + (conjoint != null && Boolean.TRUE.equals(conjoint.getEstSalarie()) ? "[X]" : "[ ]")
                + "   NON " + (conjoint != null && Boolean.FALSE.equals(conjoint.getEstSalarie()) ? "[X]" : "[ ]")).setFontSize(10));
        document.add(new Paragraph("Nom et adresse de l'employeur du conjoint : ....................").setFontSize(10));
        document.add(new Paragraph("Est-elle affiliée à une mutuelle ?   [ ] OUI   [ ] NON").setFontSize(10));

        // Enfants
        document.add(new Paragraph("\n2. ENFANTS :").setBold().setFontSize(10));
        Table childTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
        childTable.addHeaderCell(new Cell().add(new Paragraph("PRENOM").setBold().setTextAlignment(TextAlignment.CENTER)));
        childTable.addHeaderCell(new Cell().add(new Paragraph("DATE DE NAISSANCE").setBold().setTextAlignment(TextAlignment.CENTER)));
        
        for (Beneficiaire e : enfants) {
            childTable.addCell(new Cell().add(new Paragraph(e.getPrenom()).setTextAlignment(TextAlignment.CENTER)));
            childTable.addCell(new Cell().add(new Paragraph(e.getDateNaissance() != null ? sdf.format(e.getDateNaissance()) : "").setTextAlignment(TextAlignment.CENTER)));
        }
        // Add empty rows if needed
        for (int i = enfants.size(); i < 2; i++) {
            childTable.addCell(new Cell().setHeight(20));
            childTable.addCell(new Cell().setHeight(20));
        }
        document.add(childTable);

        document.add(new Paragraph("\n*Je déclare sur l'honneur que les renseignements ci-dessus sont exacts et je m'engage à informer la CMSS de tout autre changement qui pourrait intervenir ultérieurement.")
                .setFontSize(8).setItalic());

        document.add(new Paragraph("\n______________________________________________________________________________").setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Réservé au mutualiste").setBold().setTextAlignment(TextAlignment.CENTER));

        // --- Page 2 ---
        document.add(new AreaBreak());

        Table sigTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth().setMarginTop(10);
        sigTable.addCell(new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .add(new Paragraph("Nom, date et signature : " + (agent != null ? agent.getNom() : "")).setFontSize(10)));
        sigTable.addCell(new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .add(new Paragraph(carte.getDateDemande() != null ? sdf.format(carte.getDateDemande()) : sdf.format(new Date())).setFontSize(10).setTextAlignment(TextAlignment.RIGHT)));
        document.add(sigTable);

        document.add(new Paragraph("\n\n"));

        Table boxDelegue = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        Cell delegueCell = new Cell().setPadding(15).setMinHeight(180);
        delegueCell.add(new Paragraph("Réservé au delegué de la mutuelle").setBold().setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        delegueCell.add(new Paragraph("\nAvis :").setFontSize(10));
        delegueCell.add(new Paragraph("................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................").setFontSize(10));
        delegueCell.add(new Paragraph("\nNom, date et signature :").setFontSize(10));
        boxDelegue.addCell(delegueCell);
        document.add(boxDelegue);

        document.add(new Paragraph("\n\n"));

        Table boxCmss = new Table(UnitValue.createPercentArray(new float[]{100})).useAllAvailableWidth();
        Cell cmssCell = new Cell().setPadding(15).setMinHeight(180);
        cmssCell.add(new Paragraph("Réservé à la CMSS").setBold().setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        cmssCell.add(new Paragraph("\nAvis :").setFontSize(10));
        cmssCell.add(new Paragraph("................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................\n"
                + "................................................................................................................................................................................").setFontSize(10));
        cmssCell.add(new Paragraph("\nNom, date et signature :").setFontSize(10));
        boxCmss.addCell(cmssCell);
        document.add(boxCmss);

        document.close();
        return baos.toByteArray();
    }
}
