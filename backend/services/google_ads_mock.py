"""
Google Ads Mock Service
Provides mock data using standard Google Ads API response structure.
Once the Developer Token is approved, this can be swapped for real API calls.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random
import uuid

# Standard Google Ads API response structure for Campaign Performance Reports
class GoogleAdsMockService:
    """
    Mock service for Google Ads API.
    Implements standard response structures for campaign performance reports.
    """
    
    def __init__(self):
        self.campaigns = self._generate_mock_campaigns()
        self.last_refresh = datetime.now()
    
    def _generate_mock_campaigns(self) -> List[Dict]:
        """Generate realistic mock campaign data"""
        services = ["loodgieter", "slotenmaker", "elektricien"]
        regions = ["België", "Vlaanderen", "Brussel"]
        campaign_types = ["Search", "Display", "Performance Max"]
        
        campaigns = []
        for i in range(1, 13):
            service = random.choice(services)
            region = random.choice(regions)
            campaign_type = random.choice(campaign_types)
            
            # Generate realistic metrics
            impressions = random.randint(5000, 50000)
            clicks = int(impressions * random.uniform(0.02, 0.08))  # 2-8% CTR
            conversions = int(clicks * random.uniform(0.05, 0.15))  # 5-15% conversion rate
            cost = clicks * random.uniform(0.50, 2.50)  # €0.50-2.50 CPC
            
            campaigns.append({
                "id": f"campaign_{uuid.uuid4().hex[:8]}",
                "resource_name": f"customers/1234567890/campaigns/{10000000 + i}",
                "name": f"Spoed {service.capitalize()} {region} - {campaign_type}",
                "status": random.choice(["ENABLED", "ENABLED", "ENABLED", "PAUSED"]),
                "campaign_type": campaign_type,
                "service_type": service,
                "region": region,
                "budget": {
                    "amount_micros": random.randint(50, 200) * 1000000,
                    "delivery_method": "STANDARD"
                },
                "bidding_strategy_type": "MAXIMIZE_CONVERSIONS",
                "start_date": (datetime.now() - timedelta(days=random.randint(30, 180))).strftime("%Y-%m-%d"),
                "metrics": {
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": round(clicks / impressions * 100, 2) if impressions > 0 else 0,
                    "conversions": conversions,
                    "conversion_rate": round(conversions / clicks * 100, 2) if clicks > 0 else 0,
                    "cost_micros": int(cost * 1000000),
                    "cost": round(cost, 2),
                    "average_cpc_micros": int((cost / clicks * 1000000) if clicks > 0 else 0),
                    "average_cpc": round(cost / clicks, 2) if clicks > 0 else 0,
                    "cost_per_conversion": round(cost / conversions, 2) if conversions > 0 else 0
                }
            })
        
        return campaigns
    
    def get_campaign_performance_report(
        self,
        date_range: str = "LAST_30_DAYS",
        campaign_ids: Optional[List[str]] = None,
        service_type: Optional[str] = None
    ) -> Dict:
        """
        Get campaign performance report in Google Ads API format.
        
        Args:
            date_range: LAST_7_DAYS, LAST_30_DAYS, LAST_90_DAYS, THIS_MONTH, LAST_MONTH
            campaign_ids: Optional list of campaign IDs to filter
            service_type: Optional service type filter (loodgieter, slotenmaker, elektricien)
        
        Returns:
            Dict with Google Ads API response structure
        """
        filtered_campaigns = self.campaigns.copy()
        
        # Apply filters
        if campaign_ids:
            filtered_campaigns = [c for c in filtered_campaigns if c["id"] in campaign_ids]
        
        if service_type:
            filtered_campaigns = [c for c in filtered_campaigns if c["service_type"] == service_type]
        
        # Calculate totals
        total_impressions = sum(c["metrics"]["impressions"] for c in filtered_campaigns)
        total_clicks = sum(c["metrics"]["clicks"] for c in filtered_campaigns)
        total_conversions = sum(c["metrics"]["conversions"] for c in filtered_campaigns)
        total_cost = sum(c["metrics"]["cost"] for c in filtered_campaigns)
        
        return {
            "request_id": str(uuid.uuid4()),
            "date_range": date_range,
            "customer_id": "1234567890",
            "results": filtered_campaigns,
            "summary": {
                "total_campaigns": len(filtered_campaigns),
                "active_campaigns": len([c for c in filtered_campaigns if c["status"] == "ENABLED"]),
                "paused_campaigns": len([c for c in filtered_campaigns if c["status"] == "PAUSED"]),
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "total_ctr": round(total_clicks / total_impressions * 100, 2) if total_impressions > 0 else 0,
                "total_conversions": total_conversions,
                "total_conversion_rate": round(total_conversions / total_clicks * 100, 2) if total_clicks > 0 else 0,
                "total_cost": round(total_cost, 2),
                "average_cpc": round(total_cost / total_clicks, 2) if total_clicks > 0 else 0,
                "cost_per_conversion": round(total_cost / total_conversions, 2) if total_conversions > 0 else 0
            },
            "generated_at": datetime.now().isoformat(),
            "is_mock_data": True
        }
    
    def get_keyword_performance_report(
        self,
        campaign_id: Optional[str] = None,
        date_range: str = "LAST_30_DAYS"
    ) -> Dict:
        """
        Get keyword performance report in Google Ads API format.
        """
        keywords_data = {
            "loodgieter": [
                "spoed loodgieter", "loodgieter België", "lekkage reparatie",
                "wc verstopt", "riool verstopt", "sanitair spoed", "cv ketel storing"
            ],
            "slotenmaker": [
                "slotenmaker spoed", "buitengesloten", "slot vervangen",
                "deur openen", "inbraakschade", "cilinder vervangen"
            ],
            "elektricien": [
                "elektricien spoed", "stroomstoring", "kortsluiting",
                "zekeringkast", "stopcontact reparatie", "elektrisch probleem"
            ]
        }
        
        results = []
        for service, kw_list in keywords_data.items():
            for keyword in kw_list:
                impressions = random.randint(500, 5000)
                clicks = int(impressions * random.uniform(0.03, 0.12))
                conversions = int(clicks * random.uniform(0.08, 0.20))
                cost = clicks * random.uniform(0.80, 3.00)
                
                results.append({
                    "keyword": keyword,
                    "match_type": random.choice(["EXACT", "PHRASE", "BROAD"]),
                    "service_type": service,
                    "status": "ENABLED",
                    "quality_score": random.randint(6, 10),
                    "metrics": {
                        "impressions": impressions,
                        "clicks": clicks,
                        "ctr": round(clicks / impressions * 100, 2) if impressions > 0 else 0,
                        "conversions": conversions,
                        "cost": round(cost, 2),
                        "average_cpc": round(cost / clicks, 2) if clicks > 0 else 0,
                        "cost_per_conversion": round(cost / conversions, 2) if conversions > 0 else 0
                    }
                })
        
        return {
            "request_id": str(uuid.uuid4()),
            "date_range": date_range,
            "results": results,
            "total_keywords": len(results),
            "generated_at": datetime.now().isoformat(),
            "is_mock_data": True
        }
    
    def get_geographic_performance_report(
        self,
        date_range: str = "LAST_30_DAYS"
    ) -> Dict:
        """
        Get geographic performance report for Belgian cities.
        """
        cities = [
            {"name": "Antwerpen", "province": "Antwerpen"},
            {"name": "Brussel", "province": "Brussels Hoofdstedelijk Gewest"},
            {"name": "Gent", "province": "Oost-Vlaanderen"},
            {"name": "Brugge", "province": "West-Vlaanderen"},
            {"name": "Leuven", "province": "Vlaams-Brabant"},
            {"name": "Hasselt", "province": "Limburg"},
            {"name": "Mechelen", "province": "Antwerpen"},
            {"name": "Kortrijk", "province": "West-Vlaanderen"},
            {"name": "Oostende", "province": "West-Vlaanderen"},
            {"name": "Aalst", "province": "Oost-Vlaanderen"},
        ]
        
        results = []
        for city in cities:
            # Larger cities get more traffic
            multiplier = 2.0 if city["name"] in ["Antwerpen", "Brussel", "Gent"] else 1.0
            
            impressions = int(random.randint(1000, 8000) * multiplier)
            clicks = int(impressions * random.uniform(0.03, 0.08))
            conversions = int(clicks * random.uniform(0.06, 0.15))
            cost = clicks * random.uniform(0.60, 2.20)
            
            results.append({
                "location": {
                    "city": city["name"],
                    "province": city["province"],
                    "country": "België",
                    "country_code": "BE"
                },
                "metrics": {
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": round(clicks / impressions * 100, 2) if impressions > 0 else 0,
                    "conversions": conversions,
                    "conversion_rate": round(conversions / clicks * 100, 2) if clicks > 0 else 0,
                    "cost": round(cost, 2),
                    "average_cpc": round(cost / clicks, 2) if clicks > 0 else 0,
                    "cost_per_conversion": round(cost / conversions, 2) if conversions > 0 else 0
                }
            })
        
        # Sort by impressions descending
        results.sort(key=lambda x: x["metrics"]["impressions"], reverse=True)
        
        return {
            "request_id": str(uuid.uuid4()),
            "date_range": date_range,
            "results": results,
            "total_locations": len(results),
            "generated_at": datetime.now().isoformat(),
            "is_mock_data": True
        }
    
    def get_account_summary(self) -> Dict:
        """
        Get account summary with overall performance metrics.
        """
        report = self.get_campaign_performance_report()
        summary = report["summary"]
        
        # Add account-level info
        return {
            "account_id": "1234567890",
            "account_name": "SpoedDienst24.be - Google Ads",
            "currency": "EUR",
            "timezone": "Europe/Brussels",
            "status": "ENABLED",
            "performance_30_days": summary,
            "recommendations": [
                {
                    "type": "BUDGET",
                    "message": "Verhoog budget voor 'Spoed Loodgieter Antwerpen' - campagne bereikt dagelijks budget limiet",
                    "potential_impact": "+15% meer conversies"
                },
                {
                    "type": "KEYWORD",
                    "message": "Voeg keyword 'nood elektricien' toe aan elektricien campagnes",
                    "potential_impact": "+500 impressies/week"
                },
                {
                    "type": "BID",
                    "message": "Verhoog bod voor 'buitengesloten' keyword - sterke performer",
                    "potential_impact": "+20% positie verbetering"
                }
            ],
            "generated_at": datetime.now().isoformat(),
            "is_mock_data": True,
            "note": "Dit is mock data. Zodra de Developer Token is goedgekeurd, wordt dit vervangen door echte Google Ads API data."
        }
    
    def refresh_data(self):
        """Refresh mock data with new random values"""
        self.campaigns = self._generate_mock_campaigns()
        self.last_refresh = datetime.now()
        return {"status": "refreshed", "timestamp": self.last_refresh.isoformat()}


# Singleton instance
google_ads_mock_service = GoogleAdsMockService()
