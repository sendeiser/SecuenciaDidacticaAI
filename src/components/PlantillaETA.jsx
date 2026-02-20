import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 72, // 1 inch approx
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#000',
        lineHeight: 1.6,
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
        marginTop: 18,
        marginBottom: 10,
        color: '#1e293b',
        textAlign: 'left',
    },
    subSectionHeading: {
        fontSize: 10,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginTop: 12,
        marginBottom: 6,
        color: '#334155',
        textAlign: 'left',
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
        textAlign: 'left',
    },
    paragraph: {
        marginBottom: 10,
        textAlign: 'left',
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
        fontSize: 7,
        color: '#94a3b8',
    },
    // Formal Minimalist Class Design
    classCard: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e2e8f0',
    },
    classHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#064e3b',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    sectionBox: {
        marginBottom: 10,
        paddingTop: 5,
    },
    activityBlock: {
        marginTop: 6,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9',
    },
    sectionLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
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

                {/* 1. Puntos de partida */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>1. Puntos de partida</Text>
                    {data.puntos_partida.map((punto, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{punto}</Text>
                        </View>
                    ))}
                </View>

                {/* 2. Fundamentación */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>2. Fundamentación de la Secuencia Didáctica</Text>
                    <Text style={styles.paragraph}>{data.fundamentacion}</Text>
                </View>

                {/* Estructura de la Secuencia Didáctica */}
                <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }}>
                    <Text style={[styles.mainTitle, { color: '#064e3b', fontSize: 10, marginBottom: 15 }]}>ESTRUCTURA DE LA SECUENCIA DIDÁCTICA</Text>

                    {/* A. Propósitos */}
                    <Text style={styles.sectionHeading}>A. Propósitos</Text>
                    {data.estructura.propositos.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}

                    {/* B. Saberes */}
                    <Text style={styles.sectionHeading}>B. Saberes / Contenidos</Text>
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
                </View>

                {/* D. Plan de Clases */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>D. Plan de Clases y Actividades</Text>

                    {data.clases.map((clase, idx) => (
                        <View key={idx} style={styles.classCard}>
                            <Text style={styles.classHeader}>{clase.nombre}</Text>

                            {['inicio', 'desarrollo', 'cierre'].map((sectionKey) => (
                                <View key={sectionKey} style={styles.sectionBox}>
                                    <Text style={styles.sectionLabel}>
                                        {sectionKey === 'inicio' ? '📍 Apertura' : sectionKey === 'desarrollo' ? '📝 Desarrollo' : '🏁 Cierre'}
                                    </Text>

                                    {/* Image if position matches current section */}
                                    {(clase.imagen || clase.imagen_url) && (clase.imagen_posicion === sectionKey || (!clase.imagen_posicion && sectionKey === 'desarrollo')) && (
                                        <Image src={clase.imagen || clase.imagen_url} style={styles.classImage} />
                                    )}

                                    <Text style={[styles.paragraph, { lineHeight: 1.6, fontSize: 9, color: '#334155' }]}>{clase[sectionKey]}</Text>

                                    {sectionKey === 'desarrollo' && (
                                        <>
                                            <View style={{ marginTop: 5, borderTopWidth: 0.5, borderTopColor: '#f1f5f9', paddingTop: 5 }}>
                                                <Text style={[styles.label, { fontSize: 8, color: '#64748b' }]}>Diferenciación:</Text>
                                                <Text style={[styles.paragraph, { paddingLeft: 10, fontSize: 8, color: '#64748b' }]}>{clase.diferenciacion}</Text>
                                            </View>

                                            {/* Videos strictly in development for flow */}
                                            {(clase.youtube_url || (clase.recursos_audiovisuales?.youtube && clase.recursos_audiovisuales.youtube.length > 0)) && (
                                                <View style={styles.mediaContainer}>
                                                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#059669', marginBottom: 4 }}>CONTENIDO AUDIOVISUAL:</Text>
                                                    {clase.youtube_url && (
                                                        <Text style={{ marginBottom: 2 }}>
                                                            <Text style={{ fontWeight: 'bold' }}>• Link:</Text> <Link src={clase.youtube_url} style={styles.youtubeLink}>{clase.youtube_url}</Link>
                                                        </Text>
                                                    )}
                                                    {clase.recursos_audiovisuales?.youtube?.map((vid, vidIdx) => (
                                                        <Text key={vidIdx} style={{ marginBottom: 2 }}>
                                                            <Text style={{ fontWeight: 'bold' }}>• {vid.titulo}:</Text> <Link src={vid.url_sugerida} style={styles.youtubeLink}>Ver Video</Link>
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* E. Evaluación */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>E. Evaluación</Text>

                    <Text style={[styles.subSectionHeading, { marginBottom: 10 }]}>Rúbrica de Desempeño:</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellHeader}>CRITERIOS</Text></View>
                            <View style={[styles.tableCol, { width: '75%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>NIVELES DE DESEMPEÑO</Text></View>
                        </View>
                        <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <View style={[styles.tableCol, { width: '25%' }]}></View>
                            <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCellHeader}>INICIAL</Text></View>
                            <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCellHeader}>BÁSICO</Text></View>
                            <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCellHeader}>SATISFACTORIO</Text></View>
                            <View style={[styles.tableCol, { width: '18.75%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>DESTACADO</Text></View>
                        </View>
                        {(data.evaluacion.rubrica || []).map((row, i) => (
                            <View key={i} style={[styles.tableRow, { borderBottomWidth: i === (data.evaluacion.rubrica?.length - 1) ? 0 : 1 }]}>
                                <View style={[styles.tableCol, { width: '25%', backgroundColor: '#f8fafc' }]}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{row.criterio}</Text></View>
                                <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCell}>{row.inicial}</Text></View>
                                <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCell}>{row.basico}</Text></View>
                                <View style={[styles.tableCol, { width: '18.75%' }]}><Text style={styles.tableCell}>{row.satisfactorio}</Text></View>
                                <View style={[styles.tableCol, { width: '18.75%', borderRightWidth: 0 }]}><Text style={styles.tableCell}>{row.destacado}</Text></View>
                            </View>
                        ))}
                    </View>

                    <View style={{ marginTop: 15 }}>
                        <Text style={[styles.label, { fontSize: 9, marginBottom: 5 }]}>Instrumentos de Evaluación:</Text>
                        {(data.evaluacion.instrumentos || []).map((ins, i) => (
                            <Text key={i} style={[styles.paragraph, { marginBottom: 2, fontSize: 8 }]}>• {ins}</Text>
                        ))}
                    </View>
                </View>

                {/* F. Bibliografía */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>F. Bibliografía (Normas APA 7ma Ed.)</Text>
                    {(data.bibliografia || []).map((b, i) => (
                        <Text key={i} style={[styles.paragraph, { marginBottom: 4, fontSize: 8, fontStyle: 'italic' }]}>• {b}</Text>
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
