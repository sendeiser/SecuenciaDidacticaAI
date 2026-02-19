import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#000',
        lineHeight: 1.4,
    },
    topBorder: {
        borderTopWidth: 2,
        borderTopColor: '#064e3b', // Dark emerald
        marginBottom: 15,
    },
    headerWrapper: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
    },
    mainTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionHeading: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
    },
    subSectionHeading: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    col: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
    },
    listText: {
        flex: 1,
        textAlign: 'justify',
    },
    paragraph: {
        marginBottom: 8,
        textAlign: 'justify',
    },
    italics: {
        fontStyle: 'italic',
    },
    table: {
        marginTop: 15,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 30,
    },
    tableHeaderRow: {
        backgroundColor: '#e6f3e6', // Soft green to keep original vibe but professional
    },
    tableCol: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    tableCellHeader: {
        fontWeight: 'bold',
        fontSize: 8,
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 7,
    },
    mediaContainer: {
        marginTop: 5,
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: '#10b981',
    },
    classImage: {
        width: '100%',
        maxHeight: 200,
        objectFit: 'contain',
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    youtubeLink: {
        color: '#2563eb',
        textDecoration: 'underline',
        fontSize: 9,
    },
    footerContainer: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    }
});

const PlantillaETA = ({ data }) => {
    if (!data) return null;

    return (
        <Document title={`Secuencia_${data.encabezado.materia}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.topBorder} />

                <View style={styles.headerWrapper}>
                    <Text style={[styles.mainTitle, { color: '#064e3b', textTransform: 'uppercase', textAlign: 'center' }]}>
                        Secuencia Didáctica Institucional
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>
                        {data.encabezado.materia}
                    </Text>

                    {/* 1. Encabezado */}
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text><Text style={styles.label}>Institución:</Text> {data.encabezado.institucion}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text><Text style={styles.label}>Zona:</Text> {data.encabezado.zona}</Text>
                        </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 2 }]}>DATOS DEL DOCENTE:</Text>
                    <View style={{ marginTop: 5, flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={{ width: '50%', marginBottom: 3 }}><Text style={styles.label}>Docente:</Text> {data.encabezado.docente}</Text>
                        <Text style={{ width: '50%', marginBottom: 3 }}><Text style={styles.label}>DNI:</Text> {data.encabezado.dni}</Text>
                        <Text style={{ width: '50%' }}><Text style={styles.label}>Ciclo:</Text> {data.encabezado.ciclo}</Text>
                        <Text style={{ width: '50%' }}><Text style={styles.label}>Año:</Text> {data.encabezado.año}</Text>
                        <Text style={{ width: '100%', marginTop: 3 }}><Text style={styles.label}>Año Lectivo:</Text> {data.encabezado.anio_lectivo}</Text>
                    </View>

                    <Text style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Eje Temático:</Text> {data.encabezado.eje_tematico}
                    </Text>
                    <Text style={{ marginTop: 5 }}>
                        <Text style={styles.label}>Secuencia:</Text> "{data.encabezado.titulo_secuencia}"
                    </Text>
                </View>

                {/* 2. Puntos de partida */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>2. Puntos de partida</Text>
                    {data.puntos_partida.map((punto, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{punto}</Text>
                        </View>
                    ))}
                </View>

                {/* 3. Fundamentación */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>3. Fundamentación de la Secuencia Didáctica</Text>
                    <Text style={styles.paragraph}>{data.fundamentacion}</Text>
                </View>

                {/* Estructura de la Secuencia Didáctica */}
                <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
                    <Text style={styles.mainTitle}>Estructura de la Secuencia Didáctica</Text>

                    {/* A. Propósitos */}
                    <Text style={styles.sectionHeading}>A. Propósitos</Text>
                    {data.estructura.propositos.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}

                    {/* B. Saberes */}
                    <Text style={styles.sectionHeading}>B. Eje - Saberes - Contenidos a desarrollar</Text>
                    {data.estructura.saberes.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}

                    {/* C. Objetivos */}
                    <Text style={styles.sectionHeading}>C. Objetivos</Text>
                    {data.estructura.objetivos.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}

                    {/* D. Clases */}
                    <Text style={styles.sectionHeading}>D. Clases - Actividades</Text>
                    {data.clases.map((clase, i) => (
                        <View key={i} style={{ marginBottom: 20 }}>
                            <Text style={styles.subSectionHeading}>{clase.nombre}</Text>

                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Actividades de inicio (15-20 minutos):</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10, marginTop: 3 }]}>{clase.inicio}</Text>

                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Actividades de desarrollo (40-60 minutos):</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10, marginTop: 3 }]}>{clase.desarrollo}</Text>

                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Actividades de cierre (15-20 minutos):</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10, marginTop: 3 }]}>{clase.cierre}</Text>

                            <Text style={[styles.label, { fontSize: 9 }]}>Consignas metacognitivas:</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10 }]}>{clase.metacognicion}</Text>

                            <Text style={[styles.label, { fontSize: 9 }]}>Posibles errores e intervenciones:</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10 }]}>{clase.errores_intervenciones}</Text>

                            <Text style={[styles.label, { fontSize: 9 }]}>Diferenciación de actividades:</Text>
                            <Text style={[styles.paragraph, { paddingLeft: 10 }]}>{clase.diferenciacion}</Text>

                            {/* Multimedia Sections */}
                            {(clase.imagen || clase.youtube_url || (clase.recursos_audiovisuales?.youtube && clase.recursos_audiovisuales.youtube.length > 0)) && (
                                <View style={styles.mediaContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <Text style={{ fontSize: 8, fontWeight: 'bold' }}>RECURSOS SUGERIDOS:</Text>
                                    </View>

                                    {clase.youtube_url && (
                                        <Text style={{ marginBottom: 4 }}>
                                            <Text style={{ fontWeight: 'bold' }}>• Video:</Text> <Link src={clase.youtube_url} style={styles.youtubeLink}>{clase.youtube_url}</Link>
                                        </Text>
                                    )}

                                    {clase.recursos_audiovisuales?.youtube?.map((vid, vidIdx) => (
                                        <Text key={vidIdx} style={{ marginBottom: 2 }}>
                                            <Text style={{ fontWeight: 'bold' }}>• {vid.titulo}:</Text> <Link src={vid.url_sugerida} style={styles.youtubeLink}>Ver en YouTube</Link>
                                        </Text>
                                    ))}

                                    {clase.imagen && (
                                        <Image src={clase.imagen} style={styles.classImage} />
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* F. Evaluación */}
                <View break style={styles.section}>
                    <Text style={styles.sectionHeading}>F. Evaluación</Text>
                    <Text style={[styles.subSectionHeading, { marginBottom: 10 }]}>Criterios de Evaluación:</Text>

                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>CRITERIOS</Text></View>
                            <View style={[styles.tableCol, { width: '80%' }]}><Text style={styles.tableCellHeader}>NIVELES DE DESEMPEÑO</Text></View>
                        </View>
                        <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <View style={[styles.tableCol, { width: '20%' }]}></View>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>INICIALES</Text></View>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>BÁSICOS</Text></View>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>SATISFACTORIOS</Text></View>
                            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>DESTACADOS</Text></View>
                        </View>
                        {data.evaluacion.rubrica.map((row, i) => (
                            <View key={i} style={[styles.tableRow, { borderBottomWidth: i === data.evaluacion.rubrica.length - 1 ? 0 : 1 }]}>
                                <View style={[styles.tableCol, { width: '20%', backgroundColor: '#f9f9f9' }]}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.criterio}</Text></View>
                                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{row.inicial}</Text></View>
                                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{row.basico}</Text></View>
                                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{row.satisfactorio}</Text></View>
                                <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCell}>{row.destacado}</Text></View>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.subSectionHeading, { marginTop: 20 }]}>Instrumentos de Evaluación:</Text>
                    {data.evaluacion.instrumentos.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>{i + 1}.</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* G. Bibliografía */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>G. Bibliografía</Text>
                    {data.bibliografia.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footerContainer}>
                    <Text>Documento generado por Maestro de Planificaciones | Basado en el Trayecto de Actualización Matemática</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PlantillaETA;
